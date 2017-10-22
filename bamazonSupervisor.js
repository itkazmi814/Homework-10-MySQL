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
	startSupervisor();
})

function startSupervisor() {
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
		choices: ["View Products Sales by Department",
				"Create New Department",]
	}
	return inquirer.prompt(question);
}

function runCommand(answer) {
	if(answer.command === "View Products Sales by Department"){
		return viewProdSalesByDept();
	}else if(answer.command === "Create New Department"){
		return createNewDept();
	}else{
		connection.end();
	}
}

function viewProdSalesByDept () {
	console.log("view sales by dept")

	var query = "SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales, (product_sales-over_head_costs) AS total_profit " +
		"FROM departments " + 
		"LEFT JOIN products ON departments.department_name = products.department_name " +
		"GROUP BY department_id";		

	connection.query(query, (err,res) => {
		if(err) throw err;
		console.log(res);
		console.log("");
		console.table(res)
		connection.end();
	})
}

function createNewDept () {
	console.log("creating new dept");
	return askForNewDept().then( answer => addDeptToDatabase(answer) )
	connection.end();
}

function askForNewDept () {
	var question = [
		{
			name: "deptName",
			type: "input",
			message: "What is the department name?"
		},{
			name: "overHeadCosts",
			type: "input",
			message: "What are the over head costs?",
			validate: function(input) {
				if(isNaN(input) === false) {
					return true;
				}
				console.log("\nPlease enter a number")
				return false;
			}
		}
	]

	return inquirer.prompt(question);	
}

function addDeptToDatabase (answer) {
		connection.query(
			"INSERT INTO departments SET ?",
			{
				department_name: answer.deptName,
				over_head_costs: answer.overHeadCosts
			},
			(err,res) => {
				if(err) throw err;
				console.log("You have successfully added a new department with the following fields:")
				console.log(`Department Name: ${answer.deptName}`)
				console.log(`Over Head Costs: ${answer.overHeadCosts}`)
				connection.end();
			}
		);
}

