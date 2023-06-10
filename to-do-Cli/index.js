// const e = require('encryption') 
const { program } = require('commander');
const fs = require('fs');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';      //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);



program
  .name('Todo List Cli')
  .description('Encrypted To do list cli')
  .version('0.8.0');


  const encrypt = (text) =>{
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
 }

const add = (title, deadline, isDone) => {

  let data = [];
    const todoFile = fs.readFileSync('./files/thelist.txt', 'utf-8');
    data = JSON.parse(todoFile);
  
  const id = data.length > 0 ? data[data.length - 1].id + 1 : 0;
  data.push({ id, title, deadline, isDone:isDone||'to-do' });

  let encData = encrypt(JSON.stringify(data));
  
  //////////////////////////////////////////////////////////
  fs.writeFileSync('./files/thelist.txt',JSON.stringify(encData));
  console.log("Successfully added note, waiting to be completed.");
};

// method to list all notes
const list = (isDone) => {
  const data = JSON.parse(fs.readFileSync('files/thelist.txt', 'utf-8'));
  JSON.parse(decrypt(data));
  const mydata = [];

  for (let j = 0; j < data.length; j++) {
    if(isDone === data[j].isDone){ mydata.push(data[j]); console.log(mydata);}else{
      mydata[j] = data[j]}
  }
  console.log()
};

// method to edit an existing note
const edit = (id, newtitle, deadline, isDone) => {
  const ID = Number(id); // to avoid NaN
  const data = JSON.parse(fs.readFileSync('/files/thelist.txt', 'utf-8'));
  let found = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === ID) {
      data[i].title = newtitle;
      data[i].deadline = deadline;
      data[i].isDone = isDone;
      fs.writeFileSync('/files/thelist.txt', JSON.stringify(data));
      console.log(`Note with ID ${ID} has been edited and saved.`);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log(`Note with ID ${ID} not found.`);
  }
};

program
  .command('add <title> <deadline>')
  .description('Add a new note')
  .argument('title')
  .option('-d, --done', 'Mark note as done')
  .action((title, deadline, options) => {
    add(title, deadline, options.done ? 'done' : 'to-do');
  });

program
  .command('list [isDone]')
  .description('List all notes')
  .action((isDone) => {
    list(isDone);
  });

program
  .command('edit <id> <newtitle> <deadline>')
  .description('Edit an existing note')
  .option('-d, --done', 'Mark note as done')
  .action((id, newtitle, deadline, options) => {
    edit(id, newtitle, deadline, options.done ? 'done' : 'to-do');
  });

program.parse();