"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./utils/database");
dotenv_1.default.config();
(0, database_1.connectDB)(); // Connect to the database
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send('Well done!');
});
app.listen(3000, () => {
    console.log('The application is listening on 3000!');
});
