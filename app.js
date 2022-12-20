const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, `cricketTeam.db`);
let db = null;
const convertConnectionDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
convertConnectionDatabase();
app.get("/players/", async (request, response) => {
  const DataValue = `SELECT
      *
    FROM
    cricket_team
    ORDER BY
    player_id;`;

  const dbObject = await db.all(DataValue);
  let listValue = [];

  for (let value of dbObject) {
    listValue.push({
      playerId: value.player_id,
      playerName: value.player_name,
      jerseyNumber: value.jersey_number,
      role: value.role,
    });
  }
  response.send(listValue);
});

app.post("/players/", async (request, response) => {
  const bodyPost = request.body;

  const { playerName, jerseyNumber, role } = bodyPost;
  const createPostTeam = `
    INSERT INTO
      cricket_team(player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
       
      );`;
  const dbObject = await db.run(createPostTeam);
  const playerID = dbObject.lastID;

  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getTeam = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};
    ORDER BY player_name ;`;

  const dbObject = await db.get(getTeam);
  const valueObject = {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
  response.send(valueObject);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const bodyUpdate = request.body;
  const { playerName, jerseyNumber, role } = bodyUpdate;
  const getUpdateTeam = `UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number='${jerseyNumber}',
      role='${role}'
    WHERE
      player_id = ${playerId};`;
  const dbObject = await db.run(getUpdateTeam);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteTeam = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const dbObject = await db.run(deleteTeam);

  response.send("Player Removed");
});

module.exports = app;
