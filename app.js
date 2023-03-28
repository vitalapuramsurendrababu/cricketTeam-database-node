const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

let dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeandstartserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`dbError: ${e.message}`);
    process.exit(1);
  }
};

initializeandstartserver();

const convertobject = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

//getting all players
const allplayers = app.get("/players/", async (request, response) => {
  const getplayers = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersList = await db.all(getplayers);
  dataObj = [];
  for (let each of playersList) {
    let f = convertobject(each);
    dataObj.push(f);
  }
  response.send(dataObj);
});

//playeradd
app.post("/players/", async (request, response) => {
  const playerdetails = request.body;
  const { playerName, jerseyNumber, role } = playerdetails;
  const postquery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(postquery);
  response.send("Player Added to Team");
});

//playerid
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayerquery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getplayerquery);
  response.send(convertobject(player));
});

//playerupdate

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerdetails = request.body;
  const { playerName, jerseyNumber, role } = playerdetails;
  const updateplayerquery = `UPDATE cricket_team SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' WHERE player_id=${playerId};`;
  const dbResponse = await db.run(updateplayerquery);
  response.send("Player Details Updated");
});

//delete

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletequery = `
                    DELETE FROM cricket_team WHERE player_id=${playerId};`;
  const dbResponse = await db.run(deletequery);
  response.send("Player Removed");
});

module.exports = allplayers;
