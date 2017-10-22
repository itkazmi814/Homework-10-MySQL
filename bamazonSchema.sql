DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
item_id INTEGER(10) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(50) NOT NULL,
department_name VARCHAR(50) NOT NULL,
price INTEGER(10) NULL,
stock_quantity INTEGER(10),
PRIMARY KEY (item_id)
);

CREATE TABLE departments(
department_id INTEGER(10) AUTO_INCREMENT NOT NULL,
department_name VARCHAR(50) NOT NULL,
over_head_costs INTEGER(10) NOT NULL,
PRIMARY KEY (department_id)
);

INSERT INTO products (product_name,department_name,price,stock_quantity)
VALUES ("Sweater","Clothing",54,7), ("Tshirt","Clothing",23,12),("Toilet paper","Household",10,23),
("Towel","Household",8,2),("Webcam","Electronics",23,4),("HDMI Cable","Electronics",10,8),
("Banana","Grocery",2,14),("Potato","Grocery",3,17),("Monitor","Electronics",130,6),
("Dishsoap","Household",9,1);

INSERT INTO departments (department_name,over_head_costs)
VALUES ("Clothing",1000),("Household",500),("Electronics",1500),("Grocery",1200);

ALTER TABLE products
ADD product_sales INTEGER(10) NOT NULL;

SELECT * FROM products;
SELECT * FROM departments;

SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales, (product_sales-over_head_costs) AS total_profit
FROM departments
INNER JOIN products ON departments.department_name = products.department_name
GROUP BY department_id