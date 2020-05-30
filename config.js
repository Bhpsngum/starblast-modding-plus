let success=1;
try
{
    let fail=0;
    $.ajax("https://raw.githubusercontent.com/dpleshkov/starblast-modding-plus/master/main.js")
    .done(function (response) {
        let init;

        eval("init = function (){"+response+"}");

        let parsed = new init();

        function showtick(req, isNotify, needEdit)
        {
            let suc=0,f;
            switch((req||"").toLowerCase())
            {
                case "true":
                case "false":
                    f=req;
                    suc=1;
                    break;
                case "":
                    if (["true","false"].indexOf(localStorage.showtick) == -1) f="true";
                    suc=1;
                    break;
                default:
                    if (needEdit)
                        if (["true","false"].indexOf(localStorage.showtick) == -1) f="true";
                    (isNotify) && game.modding.terminal.echo("Please specify true/false to proceed");
            }
            (f) && localStorage.setItem("showtick",f);
            return suc;
        }

        game.modding.commands.showtick = function(req)
        {
            let cmd=req.trim().split(" ");

            (showtick(cmd[1],1,1)) && game.modding.terminal.echo(`Automatic tick logging is ${(localStorage.showtick == "true")?"enabled":"disabled"}`);
        }

        game.modding.tick = function(t) {
            var e;
            if (this.game.tick(t), e = Date.now(), null != parsed.extendedTick && parsed.extendedTick(this.game), null != this.context.tick && this.context.tick(this.game), e = Date.now() - e, this.max_tick_time = Math.max(this.max_tick_time, e), this.tick_time += e, this.tick_count += 1, this.tick_count >= 600) return showtick(null,0),(localStorage.showtick == "true")?(this.terminal.echo("Tick CPU time: average " + Math.round(this.tick_time / this.tick_count) + " ms ; max " + Math.round(this.max_tick_time) + " ms"), this.terminal.echo("Data sent: " + Math.round(this.I1I0I.log_sent / this.tick_count * 60) + " bytes per second")):void 0, this.tick_count = 0, this.tick_time = 0, this.max_tick_time = 0, this.I1I0I.log_sent = 0
        }
        Object.assign(lOlO0.prototype,{
          eventReceived: function(t) {
            var e, i, s, n, r;
            if (null != t.data) {
                null != t.data.ship && (r = this.modding.game.findShip(t.data.ship), t.data.ship = r), null != t.data.killer && (n = this.modding.game.findShip(t.data.killer), t.data.killer = n), null != t.data.alien && (e = this.modding.game.findAlien(t.data.alien), t.data.alien = e), null != t.data.asteroid && (i = this.modding.game.findAsteroid(t.data.asteroid), t.data.asteroid = i), null != t.data.collectible && (s = this.modding.game.findCollectible(t.data.collectible), t.data.collectible = s);
                try {
                    null != parsed.extendedEvent && parsed.extendedEvent(t.data, this.modding.game), null != this.modding.context.event && this.modding.context.event(t.data, this.modding.game)
                } catch (t) {
                    t
                }
                switch (t.data.name) {
                    case "asteroid_destroyed":
                        if (null != i) return i.killed = !0;
                        break;
                    case "alien_destroyed":
                        if (null != e) return e.killed = !0;
                        break;
                    case "collectible_picked":
                        if (null != s) return s.killed = !0
                }
            }
          },
          shipDisconnected: function(t) {
            var e=this.modding.game.findShip(t.id);
            if (e != null) return this.context.event != null && this.context.event({name:"ship_disconnected",ship:e},this.modding.game),e.lI101 = !0
          }
        });
    })
    .fail(() => {fail=1;});

    if (fail) throw "Fetching failed";
}
catch(e)
{
    success=0;
    console.log(e);
    game.modding.terminal.error("An error occured while executing the Modding+ extensions!");
}
(success) && game.modding.terminal.echo("Successfully initialized Modding+ extensions into the Modding engine!\nRead the documentation ",
    {finalize: function($div){
        $div.children().last().append('<a href="https://github.com/dpleshkov/starblast-modding-plus/blob/master/docs.md" title="Modding+ Documentation" target="_blank">here</a>')
    }}
);
