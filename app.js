const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');

const app = express(); 
app.set('view engine', 'ejs'); // telling it to use ejs  ... place it before express()
app.use(express.static("public")); // a public folder to load all the static files and entities like imgs
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb+srv://mubarak:mubarak123@cluster0.2yeunas.mongodb.net/todolistDB"); // DB construction and connection

const defaultItems = [
    { name:  'Hi! welcome to your lists.' },
    { name:  'Tap the + button to add.' },
    { name:  '<-- click to cross-over.' },
];

const itemSchema = {
    name: {
        type: String,
        required: true
    }
};

const Item = mongoose.model('Item', itemSchema); // model 


const listSchema = {
    name: {
        type: String,
        required: true
    },
    items: [itemSchema]
};

const List = mongoose.model('List', listSchema); // model 




// GET for the form:
app.get("/", (req, res)=>{
   
    async function retrieve() {
        try{
            const ITEMS = await Item.find();
            // console.log('the retrieved items are', ITEMS);
            res.render('list', {pageTitle: "Today", anotherItems: ITEMS, action: "/"});
        } catch (error){
            console.log(error);
        }
    } 
    
    retrieve(); 
})

// adding to all pages
app.post('/:pageTitle', function(req, res){
    const Title = req.params.pageTitle;

    let nextitem = req.body.nextitem;
    const item = new Item({
        name: nextitem
    })
    if(Title === "Today") {
        item.save(); 
        res.redirect('/');
    } else {
        async function findAndInsert() {
            try{
                const foundList = await List.findOne({
                    name: Title
                });
                foundList.items.push(item);
                foundList.save(); 
                res.redirect('/' + Title);

            } catch (error){
                console.log(error);
            }
        } 
        findAndInsert();
    }
     
    
    
})


// DYNAMIC PAGES > > >
 
app.get('/:customListName', function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    async function findList() {
        try{
            const findList = await List.findOne({name: customListName});
            if(findList){
                // if exist, show the list:
                res.render('list', {pageTitle: findList.name, anotherItems: findList.items, action: "/" + customListName});

            } else {
                // in case of non existance, create new list: 
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });

                newList.save(); 
                res.render('list', {pageTitle: newList.name, anotherItems: newList.items, action: "/" + customListName});

            }
        }  catch (error) {
            console.log(error);
            } 
    }
    
    findList();
    
})

//delete
app.post('/:pageTitle/delete', function(req, res){
    const Title = req.params.pageTitle;
    const DELETE_ID = req.body.checkbox;
    if (Title === "Today") { // Homepage: 
        
        async function deleteOn() {
            try{
                const deleteONE = await Item.findByIdAndDelete(DELETE_ID);
            } catch (error){
                console.log(error);
            }
        } 
        deleteOn(); 
        res.redirect('/');
    } else { // other than home page: 
        async function findAndDelete() { // construct
            try{
                const foundList = await List.findOne({
                    name: Title
                });
                const foundItem = foundList.items;
                const foundItemIndex = foundList.items.findIndex(item => item._id == DELETE_ID);

        if (foundItemIndex !== -1) {
          // Remove the item from the array
          foundList.items.splice(foundItemIndex, 1);
          
          // Save the updated list
          await foundList.save();
          
          console.log("Item deleted successfully");
          res.redirect('/' + Title);
        } else {
          console.log("Item not found in the list");
        }
      } catch (error) {
        console.log(error);
      }
    }
    findAndDelete();
    
  }
});

 
app.listen(process.env.PORT || 3000, function(){
    console.log("server is listening at port 3000")
})