import {MIME,fail,validateCreation,summary,isClosed} from './model.mjs';
export function createService({now=()=>Date.now()}={}){
 const ID=/^[a-f0-9]{32}$/;
 async function identity(request,input,ink,namespace){if(!input?.__inkCaller)throw fail('Open this poll from your signed-in Ink desktop.',401);return ink.request('apps/'+namespace+'/caller',{method:'POST',body:{assertion:input.__inkCaller,path:new URL(request.url).pathname+new URL(request.url).search,method:request.method,body:input}});}
 async function getPoll(ink,id,namespace){if(!ID.test(id||''))throw fail('Poll not found',404);const record=await ink.data.get(id);if(record.namespace!==namespace||record.kind!=='file'||record.archived)throw fail('Poll not found',404);let poll;try{poll=JSON.parse(record.body);}catch{throw fail('Poll not found',404);}if(poll.mime!==MIME)throw fail('Poll not found',404);return {record,poll};}
 return async function fetch(request,{ink,namespace}){try{const path=new URL(request.url).pathname;if(path==='/health'&&request.method==='GET')return Response.json({ok:true});if(request.method!=='POST')throw fail('Use an authenticated Ink app request.',405);const input=await request.json(),actor=await identity(request,input,ink,namespace);
 if(path==='/session')return Response.json({account:actor,serverNow:now()});
 if(path==='/create'){
  const clean=validateCreation(input);let prior;try{prior=await ink.data.get(clean.id);}catch(error){if(error.status!==404)throw error;}
  const existing=record=>{let value;try{value=JSON.parse(record.body);}catch{throw fail('This poll identity is already in use.',409);}if(record.namespace!==namespace||record.kind!=='file'||record.archived||value.author?.accountId!==actor.accountId||value.mime!==MIME||value.question!==clean.question||JSON.stringify(value.options?.map(o=>o.label))!==JSON.stringify(clean.options)||value.durationMinutes!==clean.durationMinutes)throw fail('This poll identity is already in use.',409);return Response.json({poll:summary(record,actor.accountId,now())});};
  if(prior)return existing(prior);
  const createdAt=now(),poll={mime:MIME,schema:1,question:clean.question,options:clean.options.map((label,i)=>({id:String(i+1),label})),durationMinutes:clean.durationMinutes,author:{accountId:actor.accountId,name:actor.name},createdAt,closesAt:createdAt+clean.durationMinutes*60000,closedAt:null,votes:{}};
  try{const record=await ink.data.create({id:clean.id,kind:'file',title:clean.question,source:'Poll.inkpoll',tags:['ink-poll'],body:JSON.stringify(poll),status:'open'});return Response.json({poll:summary(record,actor.accountId,now())},{status:201});}catch(error){if(error.status!==409)throw error;const {record}=await getPoll(ink,clean.id,namespace);return existing(record);}
 }
 if(path==='/vote'||path==='/close'){
  for(let attempt=0;attempt<64;attempt++){
   const {record,poll}=await getPoll(ink,input.pollId,namespace);
   if(path==='/vote'){
    if(!poll.options.some(option=>option.id===input.optionId))throw fail('Choose one of the poll options.');
    if(poll.votes?.[actor.accountId]){if(poll.votes[actor.accountId]!==input.optionId)throw fail('You have already voted in this poll.',409);return Response.json({poll:summary(record,actor.accountId,now())});}
    if(isClosed(poll,now()))throw fail('This poll is closed.',409);
    poll.votes={...poll.votes,[actor.accountId]:input.optionId};
   }else{
    if(poll.author.accountId!==actor.accountId)throw fail('Only the author can close this poll.',403);
    if(isClosed(poll,now()))return Response.json({poll:summary(record,actor.accountId,now())});poll.closedAt=now();
   }
   try{const result=await ink.data.update(record.id,{body:JSON.stringify(poll),status:isClosed(poll,now())?'closed':'open'},record.revision);return Response.json({poll:summary(result,actor.accountId,now())});}catch(error){if(error.status!==409||attempt===63)throw error;await new Promise(resolve=>setTimeout(resolve,Math.min(100,attempt*4)+Math.floor(Math.random()*8)));}
  }
 }
 throw fail('Poll action not found.',404);
 }catch(error){return Response.json({error:error.message||'Could not update this poll.'},{status:error.status||500});}};
}
export const fetch=createService();
