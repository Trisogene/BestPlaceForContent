import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import t4aClient from "../Components/t4aClient";

import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { textAlign } from "@mui/system";

function Home() {
  const [battles, setBattles] = useState([]);
  const [callStarted, setCallStart] = useState(false);

  //RENDERS
  //THE STATE IS CONTAINED INTO THE UPPER ONE
  const [totalSearchedBattle, setTotalSearchedBattle] = useState(0);
  const [battleWith40Players, setBattleWith40Players] = useState(0);
  const [battleWithinRightTimezone, setBattleWithinRightTimezone] = useState(0);
  const [battleWithGoodGuilds, setbattleWithGoodGuilds] = useState(0);
  const [battleWthioutBadGuilds, setbattleWthioutBadGuilds] = useState(0);

  useEffect(() => {
    console.log(battles);
    if (callStarted) {
      if (battles.length < 10000) {
        if (totalSearchedBattle <= 10000) askApiForBattle(totalSearchedBattle);
      }
    }
  }, [battles, callStarted]);

  const handleClick = () => {
    askApiForBattle(0);
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const askApiForBattle = (offset) => {
    if (offset > 0) {
      const queryString = "/battles?limit=50&offset=" + offset;
      t4aClient.get(queryString).then((res) => {
        filterBattleChunk(res.data);
      });
    } else {
      t4aClient.get("/battles?limit=50").then((res) => {
        filterBattleChunk(res.data);
        setCallStart(true);
      });
    }
  };

  const filterBattleChunk = (battleChunk) => {
    let filteredBattle = [];
    let battleWith40PlayersTemp = 0;
    let battleWithinRightTimezoneTemp = 0;
    let battleWithGoodGuildsTemp = 0;
    let battleWithoutBadguildsTemp = 0;

    setTotalSearchedBattle(totalSearchedBattle + 50);

    battleChunk.forEach((battle) => {
      let battleiD = battle.id;
      let guilds = []; // Totale gilde
      let goodGuilds = []; // Gilde contro cui fightare (20-50 persone)
      let badGuilds = []; // Gilde contro cui non si puo fightare (51-200)
      if (Object.entries(battle.players).length > 40) {
        battleWith40PlayersTemp = battleWith40PlayersTemp + 1;
        let battleDate = battle.startTime;

        let [fullDate, time] = battleDate.split("T");
        let [hour, minute, second] = time.split(":");
        if (hour >= 19 && hour <= 23) {
          battleWithinRightTimezoneTemp++;
          Object.entries(battle.players).forEach(([id, player]) => {
            if (!guilds[player.guildName]) {
              let arr = [player.name];
              guilds[player.guildName] = arr;
            } else {
              let arr = guilds[player.guildName];
              arr.push(player.guildName);
              guilds[player.guildName] = arr;
            }
          });
          Object.entries(guilds).forEach(([guildName, players]) => {
            if (players.length > 20 && players.length < 50) {
              goodGuilds.push(guildName);
            } else if (players.length >= 51) {
              badGuilds.push(guildName);
            }
          });

          if (goodGuilds.length >= 2) {
            battleWithGoodGuildsTemp = battleWithGoodGuildsTemp + 1;
            if (badGuilds == 0) {
              battleWithoutBadguildsTemp = battleWithoutBadguildsTemp + 1;
              filteredBattle.push(battle);
            }
          }
        }
      }
    });
    setBattleWith40Players(battleWith40Players + battleWith40PlayersTemp);
    setbattleWthioutBadGuilds(
      battleWthioutBadGuilds + battleWithoutBadguildsTemp
    );
    setbattleWithGoodGuilds(battleWithGoodGuilds + battleWithGoodGuildsTemp);
    setBattleWithinRightTimezone(
      battleWithinRightTimezone + battleWithinRightTimezoneTemp
    );
    setBattles(battles.concat(filteredBattle));
  };

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1, border: "1px solid black" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Item>
              {" "}
              <Button
                style={{
                  maxWidth: "100%",
                  minWidth: "100%",
                }}
                variant="contained"
                size="large"
                onClick={handleClick}
              >
                getBattles
              </Button>
            </Item>
          </Grid>

          <Grid item xs={8}>
            <Item>Total battle searched</Item>
          </Grid>
          <Grid item xs={4}>
            <Item>{totalSearchedBattle}</Item>
          </Grid>

          <Grid item xs={8}>
            <Item>Battles with more then 40 player</Item>
          </Grid>
          <Grid item xs={4}>
            <Item>{battleWith40Players}</Item>
          </Grid>

          <Grid item xs={8}>
            <Item>From 19 to 23 UTC</Item>
          </Grid>
          <Grid item xs={4}>
            <Item>{battleWithinRightTimezone} </Item>
          </Grid>

          <Grid item xs={8}>
            <Item>Have at least 2 good guilds (20+ , 50-) </Item>
          </Grid>
          <Grid item xs={4}>
            <Item> {battleWithGoodGuilds} </Item>
          </Grid>

          <Grid item xs={8}>
            <Item>Have no bad guilds (51+) </Item>
          </Grid>
          <Grid item xs={4}>
            <Item> {battleWthioutBadGuilds} </Item>
          </Grid>
        </Grid>
      </Box>
      {/* {battles.map((battle) => {
        if (battle.totalKills > 10) {
          return (
            <Box
              style={{
                border: "1px solid black",
                padding: "20px 20px 20px 20px",
                margin: "20px 20px 20px 10px",
              }}
              sx={{ width: 1 }}
            >
              <Grid container>
                <Grid item xs={12}>
                  <Item>
                    [ID]
                    <a href={"https://albionbattles.com/battles/" + battle.id}>
                      {battle.id}
                    </a>
                  </Item>
                </Grid>
                <Grid item xs={12}>
                  <Item> [TotalKills] {battle.totalKills} </Item>
                </Grid>
                {Object.entries(battle.guilds).map(([id, guild]) => {
                  if (guild.kills > 5) {
                    return (
                      <Grid item xs={2}>
                        {guild.name}
                      </Grid>
                    );
                  }
                })}
              </Grid>
            </Box>
          );
        }
      })} */}
      <Box sx={{ paddingTop: "20px", flexGrow: 1, border: "1px solid black" }}>
        <Grid container spacing={2}>
          {battles.map((battle) => {
            return (
              <Grid
                item
                xs={4}
                style={{
                  minHeight: "200px",
                  maxHeight: "200px",
                  border: "1px solid blue",
                  overflowY: "auto",
                }}
              >
                <p style={{ textAlign: "center" }}>
                  <a href={"https://albionbattles.com/battles/" + battle.id}>
                    {battle.id}
                  </a>
                </p>
                <p style={{ textAlign: "center" }}>
                  [TotalKills] {battle.totalKills}
                </p>
                {Object.entries(battle.guilds).map(([id, guild]) => {
                  if (guild.kills > 5) {
                    return <p style={{ textAlign: "center" }}>{guild.name}</p>;
                  }
                })}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default Home;
