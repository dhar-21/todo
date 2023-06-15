const express =require("express");
const bodyParser =require("body-parser");
const app = express();
//var items=[];
//var wl =[];
const mongoose = require("mongoose");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
run();
async function run() {
  try {
    mongoose.connect("mongodb+srv://dharhacks:KfYYaWCNDC7ZCqaF@cluster0.kwhiyso.mongodb.net/todolistDB");
 
    const itemsSchema = new mongoose.Schema({
      name: String,
    });
 
    const Item = mongoose.model("Item", itemsSchema);
 
    var item1 = new Item({
      name: "welcome to the todo list",
    });
    var item2 = new Item({
      name: "enter the task here and tap on + button ",
    });
    var item3 = new Item({
      name: "when your task is complcted click on respective check box",
    });
 
    var defaultItems = [item1, item2, item3];
    const listSchema = {
        name: String,
        items: [itemsSchema]
    };
    const List = mongoose.model("List", listSchema);
 
    // mongoose.connection.close();
 
    app.get("/", async function (req, res) {
      const foundItems = await Item.find({});
 
      if (!(await Item.exists())) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { kindofday: "Today", nl: foundItems });
      }
    });
app.post("/",async function(req,res){
   const itemName = req.body.to;
   const listName = req.body.list;
   const item = new Item({
    name: itemName
   });
   if (listName === "Today") {
    item.save()
    res.redirect("/")
} else {

    await List.findOne({ name: listName }).exec().then(foundList => {
        foundList.items.push(item)
        foundList.save()
        res.redirect("/" + listName)
    }).catch(err => {
        console.log(err);
    });
}
});
   
app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.check;
    const listName = req.body.listName;
    if (listName === "Today" && checkedItemId != undefined) {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");  
  } else {
    await List.findOneAndUpdate( { name: listName },
      { $pull: { items: { _id: checkedItemId } } } );
    res.redirect("/" + listName);
  }
});
  app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName})
  .then(function(foundList){
      
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultItems
          });
        
          list.save();
          console.log("saved");
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{kindofday:foundList.name, nl:foundList.items});
        }
  })
  .catch(function(err){});
  })
app.get("/work",function(req,res){
res.render("list", {kindofday:"work list",nl:wl});  
});
app.get("/about",function(req,res){
    res.render("about");
});
app.listen(process.env.PORT||3000,function(req,res){
    console.log("running");
});
} catch (e) {
    console.log(e.message);
  }
}