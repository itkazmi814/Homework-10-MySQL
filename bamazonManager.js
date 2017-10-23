var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");


//create database connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
})

//connect to database
connection.connect( err => {
	if(err) throw err;
	startManager();
})

function startManager () {
	var promise = Promise.resolve();
	promise = promise
	.then( () => getCommand() )
	.then( answer => runCommand(answer) )	
}

function getCommand() {
	var question = {
		name: "command",
		type: "list",
		message: "What would you like to do?",
		choices: ["View Products for Sale",
				"View Low Inventory",
				"Add to Inventory",
				"Add New Product",
				"Quit"]
	}
	return inquirer.prompt(question);
}

function runCommand(answer) {
	if(answer.command === "View Products for Sale"){
		return viewProductsForSale();
	}else if(answer.command === "View Low Inventory"){
		return viewLowInventory();
	}else if(answer.command === "Add to Inventory"){
		return addToInventory();
	}else if(answer.command === "Add New Product"){
		return addNewProduct();
	}else if(answer.command === "Quit"){
		console.log("Thank you. Now leaving.");
		connection.end();
	}
}

function viewProductsForSale () {
	connection.query("SELECT * FROM products",(err,res) => {
		if(err) throw err;

		console.log("");
		console.log("Current Inventory: ")
		console.log("")
		console.table(res);
		
		startManager();
	})
}

function viewLowInventory () {
	connection.query("SELECT item_id, product_name, stock_quantity FROM products HAVING stock_quantity < 5", (err,res) => {
		if(err) throw err;

		console.log("");
		console.log("The following products have an inventory count of less than five:");
		console.log("");
		console.table(res)

		startManager();
	})
}

function addToInventory (){
	console.log("add to inventory")
	connection.query("SELECT * FROM products", (err,res) => {
		if(err) throw err;
		
		Promise.resolve()
		.then( () => getProducts(res) )
		.then( products => userRestocksProduct(products) )
		.then( answer => placeRestockOrder(answer) )
	})
}

function getProducts(res) {
	var products = [];	

	for(var i=0; i< res.length; i++){
		products.push(`${res[i].item_id}. ${res[i].product_name}`);
	}
	
	return products;
} 

function userRestocksProduct (products) {
	var questions = [
		{
			name: "selectedProduct",
			type: "list",
			message: "What would you like to restock?",
			choices: products
		},{
			name: "restockAmount",
			type: "input",
			message: "How much would you like to restock?",
			validate: function(input) {
				if(isNaN(input) === false) {
					return true;
				}
				console.log("\nPlease enter a number")
				return false;
			}
		}
	];

	return inquirer.prompt(questions);
}

function placeRestockOrder (answer) {
	var restockID = answer.selectedProduct.substring(0,answer.selectedProduct.indexOf("."));
	var restockAmount = parseInt(answer.restockAmount);
	var available;

	var query = connection.query("SELECT * FROM products WHERE ?",{item_id: restockID},(err,res) => {
		if(err) throw err;

		available = res[0].stock_quantity;
		restockInventory(restockID,restockAmount,available);
	})

	return query;
}

function restockInventory(id,amount,available) {
	connection.query(
		"UPDATE products SET ? WHERE ?",
		[{stock_quantity: (available+amount)},{item_id: id}],
		(err,res) => {
			console.log("")
			console.log(`Updating quantity for item #${id} from ${available} to ${(amount+available)}`)
			console.log("")

			startManager();
		}
	); 
}

function addNewProduct (){
	return askForProduct().then( answer => addProdToDatabase(answer) )
}

function askForProduct () {
	var question = [
		{
			name: "prodName",
			type: "input",
			message: "What is the product name?"
		},{
			name: "departmentName",
			type: "input",
			message: "What department does it belong in?"
		},{
			name: "itemPrice",
			type: "input",
			message: "What is the unit price?",
			validate: function(input) {
				if(isNaN(input) === false) {
					return true;
				}
				console.log("\nPlease enter a number")
				return false;
			}
		},{
			name: "stockQuantity",
			type: "input",
			message: "How many to stock?",
			validate: function(input) {
				if(isNaN(input) === false) {
					return true;
				}
				console.log("\nPlease enter a number")
				return false;
			}
		}
	];	

	return inquirer.prompt(question);	
}

function addProdToDatabase (answer) {
		connection.query(
			"INSERT INTO products SET ?",
			{
				product_name: answer.prodName,
				department_name: answer.departmentName,
				price: answer.itemPrice,
				stock_quantity: answer.stockQuantity
			},
			(err,res) => {
				if(err) throw err;
				console.log("")
				console.log(`Added a new product: `);
				console.log(`Name: ${answer.prodName}`)
				console.log(`Department: ${answer.departmentName}`)
				console.log(`Price: ${answer.itemPrice}`)
				console.log(`Stock: ${answer.stockQuantity}`)
				console.log("")

				startManager();
			}
		);
}