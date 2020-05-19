/*Initial setup. Do not modify codes between the comments blocks! */
const GameExtender = {
    broadcastInterval:0,
    timers: [],
    print: function (item) {
        this.modding.terminal.echo(item);
    },
    echo: function (item) {
        this.print(item);
    },
    log: function (item) {
        this.print(item);
    },
    error: function (item) {
        this.modding.terminal.error(item);
    },
    kick: function (identifier) {
        let ship = this.locateShip(identifier);
        return ship && ship.gameover({
            "Status": "Kicked by operator",
            "Score": ship.score,
            "High score": ship.highscore,
            "Frags": ship.frag,
            "Deaths": ship.death
        });
    },
    kill: function (identifier) {
        let ship = this.locateShip(identifier);
        return ship && ship.set({
            kill: true
        });
    },
    locateShip: function (identifier) {
        if (typeof identifier == "number") {
            return this.ships[Math.trunc(identifier)];
        }
        let searchQuery = identifier.toLowerCase();
        for (let shipIndex in this.ships) {
            let ship = this.ships[shipIndex];
            let shipName = ship.name.toLowerCase();
            if (shipName.includes(searchQuery)) {
                return ship;
            }
        }
        return null;
    },
    setTimeout: function (func, ticks) {
        return this.timers.push(["Timeout",func, ticks, true, game.step]);
    },
    setInterval: function (func, ticks) {
        let currentTick = this.step;
        return this.timers.push(["Interval",func, ticks, true]);
    },
    clearTimer: function (index) {
        let i = Math.trunc(Number(index)||0)-1;
        if (i>-1 && i<this.timers.length) this.timers[i][3]=false;
    },
    viewTimer: function (index) {
        let i = Math.trunc(Number(index)||0)-1,a;
        if (!(i>-1 && i<this.timers.length)) return;
        a = {
          type: this.timers[i][0],
          param: this.timers[i][1]
        };
        switch (this.timers[i][0])
        {
          case "Timeout":
            a.time_expired = this.timers[i][2];
            break;
          case "Interval":
            a.interval = this.timers[i][2];
            break;
        }
        a.expired = !this.timers[i][3];
        a.toString = function(){
          return JSON.stringify(this);
        };
        return a;
    },
    reuseTimer: function (index) {
        let i = Math.trunc(Number(index)||0)-1,a;
        if (i>-1 && i<this.timers.length) this.timers[i][3] = true;
        if (this.timers[i][4]) this.timers[i][4]=game.step;
    },
    resetTimers: function ()
    {
        this.timers.forEach(function (timer) {
          timer[3]=false;
        });
    },
    instructorBroadcast: function(message, _instructor, _delay) {
        _instructor = _instructor || "Lucina";
        _delay = Number(_delay) || 120;
        this.setTimeout(function() {
          this.ships.forEach(function(ship) {
            ship.instructorSays(message, _instructor);
          });
        }.bind(this), this.broadcastInterval);
        this.broadcastInterval = this.broadcastInterval + _delay;
        this.setTimeout(function() {
            (this.broadcastInterval == _delay) && this.ships.forEach(function(ship) {
                ship.hideInstructor();
            });
            this.broadcastInterval = this.broadcastInterval - _delay;
        }.bind(this), this.broadcastInterval);
    },
    emptyWeapons: function () {
      this.ships.forEach(function(ship) {
        ship.emptyWeapons();
      });
    }
};

const ShipExtender = {
  kill: function () {
    this.set({
      kill: true
    });
    return this;
  },
  frag: 0,
  death: 0
};

for (let prop of ["invulnerable","angle"])
  eval(`ShipExtender.${prop} = function(data) {
    this.set({
      ${prop}: data
    });
    return this;
  }`);

const AlienExtender = {
  kill: function () {
    return this.set({
      kill: true
    });
  },
};

Object.assign(Asteroid.prototype, AlienExtender);

for (let prop of ["shield","regen","damage","laser_speed","rate"])
  eval(`AlienExtender.${prop} = function(data) {
    this.set({
      ${prop}: data
    });
    return this;
  }`);

AlienExtender.laserSpeed = function (data) {
    return this.laser_speed(data);
}

Object.assign(game, GameExtender);
Object.assign(I1l00.prototype, ShipExtender);
Object.assign(Alien.prototype, AlienExtender);

this.extendedTick = function (game)
{
  game.timers.forEach(function (timer) {
    if (typeof timer[1] != "function" || !timer[3])
    {
      timer[3]=false;
      return;
    }
    switch (timer[0] || "")
    {
      case "Timeout":
        if (game.step >= (Number(timer[2])||0) + timer[4]) {
          timer[1]();
          timer[3] = false;
        }
        break;
      case "Interval":
        if (game.step % timer[2] === 0) timer[1]();
        break;
    }
  });
  game.ships.forEach(function (ship) {
    ship.highscore = Math.max(ship.highscore || 0, ship.score);
    ship.rotation = ship.r * 180 / Math.PI;
  });
}

this.extendedEvent = function (event, game)
{
  switch (event.name) {
    case "ship_destroyed":
      if (!Object.is(event.killer, null)) event.killer.frag++;
      if (!Object.is(event.ship, null)) event.ship.death++;
      break;
  }
}
/* End of initial setup */

this.options = {
    // see documentation for options reference
    root_mode: "survival",
    map_size: 30
};

this.tick = function (game) {
    this.extendedTick(game);
    // do mod stuff here ; see documentation
};

this.event = function (event, game) {
    this.extendedEvent(event, game);
    // Place your event handler code here
}
