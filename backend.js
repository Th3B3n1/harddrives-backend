import express from "express";
//import https from "https";
import http from "http";
import { readFileSync } from "fs";
import mysql from 'mysql2';
import bodyParser from "body-parser";
import cors from 'cors';

const app = express();
const server = http/*s*/.createServer(/*{
    key: readFileSync("certFiles/keyfile.key"),
    cert: readFileSync("certFiles/certFile.crt")
},*/ app);
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'harddrives',
}).promise();
const jsonParser = bodyParser.json();

app.use(cors());

app.get("/", (req, res) => 
{
    res.sendStatus(200);
})

app.get("/harddrives", async (req, res) => 
{
    try
    {
        let query = await db.query("SELECT * FROM harddrives");
        res.status(200);
        res.send(query[0]);
    }
    catch (error)
    {
        res.status(503);
        res.send({"error": "Service unavaiable"}).end();
    }
})

app.get("/harddrive", async (req, res) =>
{
    if (req.query.id != undefined && parseInt(req.query.id) > 0)
    {
        try
        {
            let query = await db.query("SELECT * FROM harddrives WHERE id = ?", req.query.id);
            res.status(200);
            res.send(query[0]);
        }
        catch (error)
        {
            res.status(503);
            res.send({"error": "Service unavaiable"}).end();
        }
    }
    else
    {
        res.status(404);
        res.send({"error": "An invalid query parameter was given."}).end();
    }
})

app.post("/harddrive", jsonParser, async (req, res) => 
{
    if (req.body != undefined)
    {
        if ((req.body.manifacturer != undefined && req.body.modelNumber != undefined) && ((req.body.productFamily != undefined && req.body.capacity != undefined) && (req.body.speed != undefined && req.body.used != undefined)))
        {
            if ((req.body.manifacturer.length > 0 && req.body.modelNumber.length > 0) && ((req.body.productFamily.length > 0 && parseInt(req.body.capacity) > 0) && (parseInt(req.body.speed) > 0 && typeof(req.body.used) == "boolean")))
            {
                try
                {
                    await db.query('INSERT INTO harddrives(manifacturer, modelNumber, productFamily, capacity, speed, used) VALUES(?, ?, ?, ?, ?, ?)', [req.body.manifacturer, req.body.modelNumber, req.body.productFamily, req.body.capacity, req.body.speed, req.body.used]);
                    res.sendStatus(200).end();
                }
                catch (error)
                {
                    res.status(503);
                    res.send({"error": "Service unavaiable (MYSQL error: " + error + ")"}).end();
                }
            }
            else
            {
                res.status(400);
                res.send({"error": "Invalid data was given."}).end();
            }
        }
        else
        {
            res.status(400);
            res.send({"error": "Values are not defined."}).end();
        }
    }
    else
    {
        res.status(400);
        res.send({"error": "The request's body is empty."}).end();
    }
})

app.delete("/harddrive", async (req, res) => 
{
    if (req.query.id != undefined && parseInt(req.query.id) > 0)
    {
        try
        {
            await db.query('DELETE FROM harddrives WHERE id = ?', req.query.id);
            res.sendStatus(200).end();
        }
        catch (error)
        {
            res.status(503);
            res.send({"error": "Service unavaiable (MYSQL error: " + error + ")"}).end();
        }
    }
    else
    {
        res.status(404);
        res.send({"error": "An invalid query parameter was given."}).end();
    }
})

app.put("/harddrive", jsonParser, async (req, res) => 
{
    if ((req.query.id != undefined && parseInt(req.query.id) > 0))
    {
        if (req.body != undefined)
        {
            if ((req.body.manifacturer != undefined && req.body.modelNumber != undefined) && ((req.body.productFamily != undefined && req.body.capacity != undefined) && (req.body.speed != undefined && req.body.used != undefined)))
            {
                if ((req.body.manifacturer.length > 0 && req.body.modelNumber.length > 0) && ((req.body.productFamily.length > 0 && parseInt(req.body.capacity) > 0) && (parseInt(req.body.speed) > 0 && typeof(req.body.used) == "boolean")))
                {
                    try
                    {
                        await db.query('UPDATE harddrives SET manifacturer = ?, modelNumber = ?, productFamily = ?, capacity = ?, speed = ?, used = ? WHERE id = ?', [req.body.manifacturer, req.body.modelNumber, req.body.productFamily, req.body.capacity, req.body.speed, req.body.used, req.query.id]);
                        res.sendStatus(200).end();
                    }
                    catch (error)
                    {
                        res.status(503);
                        res.send({"error": "Service unavaiable (MYSQL error: " + error + ")"}).end();
                    }
                }
                else
                {
                    res.status(400);
                    res.send({"error": "New values are not valid."}).end();
                }
            }
            else
            {
                res.status(400);
                res.send({"error": "New values are not defined."}).end();
            }
        }
        else
        {
            res.status(400);
            res.send({"error": "The request's body is empty."}).end();
        }
    }
    else
    {
        res.status(404);
        res.send({"error": "An invalid query parameter was given."}).end();
    }
})

server.listen(5555, () => {
    console.log("Backend up! Avaiable at: localhost:5555")
});