import {startPreview} from './quick-look.mjs';
import {summary} from './model.mjs';

await startPreview({render:({file,root})=>{
 const poll=summary(file,'',Date.now()),title=document.createElement('h2');title.textContent=poll.question;root.append(title);
 for(const option of poll.options){const row=document.createElement('p'),label=document.createElement('span'),bar=document.createElement('progress');label.textContent=`${option.label} — ${option.count} (${option.percent}%) `;bar.max=100;bar.value=option.percent;row.append(label,bar);root.append(row);}
 const total=document.createElement('p');total.textContent=`${poll.total} votes · ${poll.closed?'Closed':'Open'}`;root.append(total);
}});
