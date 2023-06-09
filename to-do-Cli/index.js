import enc from './encyption';
const { program } = require('commander');
const fs = require('fs');





program
  .name('Todo List Cli')
  .description('Encrypted To do list cli')
  .version('0.8.0');

const add = (title, deadline, isDone) => {
  console.log(title);
  let data = [];
  try {
    const todoFile = fs.readFileSync('/files/thelist.txt', 'utf-8');
    data = JSON.parse(todoFile);
  } catch (err) {
    // if file doesn't exist, create it with an empty array
    fs.writeFileSync('/files/thelist.txt', JSON.stringify(data));
  }
  const id = data.length > 0 ? data[data.length - 1].id + 1 : 0;
  data.push({ id, title, deadline, isDone:isDone||'to-do' });

  const encData = enc.encrypt(JSON.stringify(data));
  
  fs.writeFileSync('/files/thelist.txt',encData);
  console.log("Successfully added note, waiting to be completed.");
};

// method to list all notes
const list = (isDone) => {
  const data = JSON.parse(fs.readFileSync('files/thelist.txt', 'utf-8'));
  const mydata = [];

  for (let j = 0; j < data.length; j++) {
    if (isDone === data[j].isDone) {
      mydata.push(data[j]);
    }//end if
  }//end for
  console.log(enc.decrypt(mydata));
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
  .option('-d, --done', 'Mark note as done')
  .action((title, deadline, options) => {
    add(title, deadline, options.done ? 'done' : 'to-do');
  });

program
  .command('list [isDone]')
  .description('List all notes')
  .action((isDone) => {
    listall(isDone);
  });

program
  .command('edit <id> <newtitle> <deadline>')
  .description('Edit an existing note')
  .option('-d, --done', 'Mark note as done')
  .action((id, newtitle, deadline, options) => {
    edit(id, newtitle, deadline, options.done ? 'done' : 'to-do');
  });

program.parse();