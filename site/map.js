/* Animated world map: glowing "idea" points appear on land and link together with arcs. */
(function () {
  var canvas = document.getElementById("map-canvas");
  if (!canvas || typeof d3 === "undefined" || typeof topojson === "undefined") return;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var landDots = []; // [x, y] in unit projection space, rescaled on resize
  var projection = d3.geoNaturalEarth1();
  var landFeature = null;

  var ideas = []; // active idea nodes {x, y, born, life}
  var links = []; // {a, b, born, dur}
  var MAX_IDEAS = 14;

  function resize() {
    var w = canvas.clientWidth || canvas.parentElement.clientWidth;
    var h = canvas.clientHeight || canvas.parentElement.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    projection.fitExtent(
      [
        [w * 0.02, h * 0.08],
        [w * 0.98, h * 0.95],
      ],
      landFeature || { type: "Sphere" }
    );
    if (landFeature) buildDots();
  }

  function buildDots() {
    landDots = [];
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    var step = Math.max(9, Math.round(w / 130));
    for (var y = 0; y < h; y += step) {
      for (var x = 0; x < w; x += step) {
        var ll = projection.invert && projection.invert([x, y]);
        if (ll && d3.geoContains(landFeature, ll)) {
          landDots.push([x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2]);
        }
      }
    }
  }

  function spawnIdea(now) {
    if (landDots.length === 0) return;
    var p = landDots[(Math.random() * landDots.length) | 0];
    var idea = { x: p[0], y: p[1], born: now, life: 9000 + Math.random() * 6000 };
    // link to 1-2 existing ideas
    var alive = ideas.filter(function (i) {
      return now - i.born < i.life - 2500;
    });
    var n = Math.min(alive.length, 1 + ((Math.random() * 2) | 0));
    alive
      .slice()
      .sort(function () {
        return Math.random() - 0.5;
      })
      .slice(0, n)
      .forEach(function (other) {
        links.push({ a: idea, b: other, born: now, dur: 1600 });
      });
    ideas.push(idea);
    if (ideas.length > MAX_IDEAS) ideas.shift();
  }

  function arcPath(a, b, t) {
    // quadratic arc from a to b, drawn up to fraction t
    var mx = (a.x + b.x) / 2;
    var my = (a.y + b.y) / 2;
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var cx = mx - dy * 0.22;
    var cy = my + dx * 0.22 - dist * 0.08;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    var steps = 24;
    var upto = Math.max(2, Math.round(steps * t));
    for (var i = 1; i <= upto; i++) {
      var s = i / steps;
      var x = (1 - s) * (1 - s) * a.x + 2 * (1 - s) * s * cx + s * s * b.x;
      var y = (1 - s) * (1 - s) * a.y + 2 * (1 - s) * s * cy + s * s * b.y;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  var lastSpawn = 0;
  function frame(now) {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // land dots
    ctx.fillStyle = "rgba(79, 140, 255, 0.28)";
    for (var i = 0; i < landDots.length; i++) {
      ctx.fillRect(landDots[i][0], landDots[i][1], 1.6, 1.6);
    }

    if (now - lastSpawn > 1400 && ideas.length < MAX_IDEAS) {
      spawnIdea(now);
      lastSpawn = now;
    }

    // links
    links = links.filter(function (l) {
      return ideas.indexOf(l.a) !== -1 && ideas.indexOf(l.b) !== -1;
    });
    links.forEach(function (l) {
      var t = Math.min(1, (now - l.born) / l.dur);
      var aAge = (now - l.a.born) / l.a.life;
      var bAge = (now - l.b.born) / l.b.life;
      var fade = Math.min(1, 4 * (1 - Math.max(aAge, bAge)));
      if (fade <= 0) return;
      ctx.strokeStyle = "rgba(55, 224, 184," + 0.55 * fade + ")";
      ctx.lineWidth = 1.2;
      arcPath(l.a, l.b, t);
      // moving pulse along completed links
      if (t >= 1) {
        var s = ((now - l.born) % 2200) / 2200;
        var mx = (l.a.x + l.b.x) / 2 - (l.b.y - l.a.y) * 0.22;
        var my =
          (l.a.y + l.b.y) / 2 +
          (l.b.x - l.a.x) * 0.22 -
          Math.hypot(l.b.x - l.a.x, l.b.y - l.a.y) * 0.08;
        var px = (1 - s) * (1 - s) * l.a.x + 2 * (1 - s) * s * mx + s * s * l.b.x;
        var py = (1 - s) * (1 - s) * l.a.y + 2 * (1 - s) * s * my + s * s * l.b.y;
        ctx.fillStyle = "rgba(255, 200, 97," + 0.9 * fade + ")";
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // idea nodes
    ideas = ideas.filter(function (idea) {
      return now - idea.born < idea.life;
    });
    ideas.forEach(function (idea) {
      var age = (now - idea.born) / idea.life;
      var fade = Math.min(1, 6 * Math.min(age, 1 - age));
      var pulse = 1 + 0.35 * Math.sin(now / 300 + idea.x);
      var r = 3.2 * pulse;
      var grd = ctx.createRadialGradient(idea.x, idea.y, 0, idea.x, idea.y, r * 5);
      grd.addColorStop(0, "rgba(55, 224, 184," + 0.85 * fade + ")");
      grd.addColorStop(1, "rgba(55, 224, 184, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(idea.x, idea.y, r * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(232, 238, 252," + fade + ")";
      ctx.beginPath();
      ctx.arc(idea.x, idea.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(frame);
  }

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (topo) {
      landFeature = topojson.feature(topo, topo.objects.land);
      resize();
      requestAnimationFrame(frame);
    })
    .catch(function () {
      /* map data unavailable: hero still renders without animation */
    });

  window.addEventListener("resize", resize);
})();
