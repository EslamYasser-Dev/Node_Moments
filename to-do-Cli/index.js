const { program } = require('commander');
const fs = require('fs');
const crypto = require('node:crypto');
 
const encrypt = (text, key, iv) => {
  const cipher = crypto.createCipheriv('aes-128-ccm', key, iv, {
    authTagLength: 16  // 16 bytes = 128 bits
  });
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const key = crypto.randomBytes(16);  // 16 bytes = 128 bits
const iv = crypto.randomBytes(12);   // 12 bytes = 96 bits

const encryptedText = encrypt('dfdssdfs', key, iv);
console.log(encryptedText);


const decrypt = (encryptText) => {
  const deCiphr = crypto.createDecipheriv('aes-128-ccm',key,iv);
  let decryptText = deCiphr.update(encryptText,'hex','utf-8');
  decryptText +=deCiphr.final('utf-8');
  console.log(decryptText);
};

const add = (title, deadline, isDone) => {
  let data = [];
  const todoFile = fs.readFileSync('./files/thelist.json', 'utf-8');
  data = JSON.parse(todoFile);
let t = encrypt(title,key,iv);
let d = encrypt(deadline,key,iv);
  const id = data.length > 0 ? data[data.length - 1].id + 1 : 0;
  data.push({ id: id, title: t, deadline: d || 'will set later', isDone: isDone || 'to-do' });
  fs.writeFileSync('./files/thelist.json', JSON.stringify(data));
  console.log("Successfully added note, waiting to be completed.");
};
const list = (isDone) => {
  let x = crypto.randomBytes(32)
  console.log(x)
  const todoFile = fs.readFileSync('./files/thelist.json', 'utf-8');
  if (todoFile) {
    const data = JSON.parse(todoFile);
    const mydata = data.filter((item) => {
      if (isDone === undefined) {
        return item;
      } else {
        return item.isDone === isDone;        
      }
    });

    // Decrypt the title and deadline values in each item
    for (let i = 0; i < mydata.length; i++) {
      mydata[i].title = decrypt(mydata[i].title);
      mydata[i].deadline = decrypt(mydata[i].deadline);
    }

    console.log(mydata);
  } else {
    console.log('No notes found for this is');
  }
};

const edit = (id, newtitle, deadline, isDone) => {
  const ID = Number(id); // to avoid NaN
  let data = [];
  const todoFile = fs.readFileSync('./files/thelist.json', 'utf-8');
  if (todoFile) {
    data = JSON.parse(decrypt(JSON.parse(todoFile)));
  }

  let found = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === ID) {
      if (newtitle) {
        data[i].title = newtitle;
      }
      if (deadline) {
        data[i].deadline = deadline;
      }
      if (isDone) {
        data[i].isDone = isDone;
      }
      fs.writeFileSync('./files/thelist.txt', JSON.stringify(encrypt(JSON.stringify(data))));
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
  .name('Todo List Cli')
  .description('Encrypted To do list cli')
  .version('0.8.0');

program
  .command('add <title> <deadline>')
  .description('Add a new note')
  .argument('<title>')
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
    edit(id, newtitle, deadline, options.done ? 'done' : undefined);
  });

program.parse();