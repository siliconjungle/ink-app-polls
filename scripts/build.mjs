import {cp,mkdir,copyFile,rm,readFile,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');await cp('public','dist',{recursive:true});
const model=await readFile('model.mjs','utf8'),server=await readFile('server.mjs','utf8');
// Ink's runtime receives backend.entry separately from browser asset storage.
// Inline this dependency-free shared model so the backend is one complete module.
await writeFile('dist/server.mjs',model+'\n'+server.replace(/^import .* from '\.\/model\.mjs';\n/,''));
await copyFile('model.mjs','dist/model.mjs');await copyFile('icon.svg','dist/icon.svg');console.log('Built Polls with shared Ink styles, browser SDK and a self-contained private backend.');
