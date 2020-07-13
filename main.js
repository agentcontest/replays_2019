(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Monitor = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var styles = require("./styles");
var GRID = 20; // todo: make const
function render(canvas, ctrl) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    if (ctrl.vm.static)
        renderStatic(canvas, ctx, ctrl.vm.static);
    if (ctrl.vm.static && ctrl.vm.dynamic)
        renderDynamic(ctx, ctrl.vm.static, ctrl.vm.dynamic);
    if (ctrl.vm.static && ctrl.vm.dynamic && ctrl.vm.hover)
        renderHover(ctx, ctrl.vm.static, ctrl.vm.dynamic, ctrl.vm.hover);
    ctx.restore();
}
exports.render = render;
function invClientPos(canvas, world, clientX, clientY) {
    var clientRect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((clientX - clientRect.left - Math.floor((canvas.width - world.grid.width * GRID) / 2)) / GRID),
        y: Math.floor((clientY - clientRect.top - Math.floor((canvas.height - world.grid.height * GRID) / 2)) / GRID)
    };
}
exports.invClientPos = invClientPos;
function renderHover(ctx, st, world, hover) {
    if (hover.x < 0 || hover.x >= st.grid.width || hover.y < 0 || hover.y >= st.grid.height)
        return;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(180, 180, 255, 0.4)';
    ctx.rect(hover.x * GRID, hover.y * GRID, GRID, GRID);
    ctx.fill();
    for (var _i = 0, _a = world.entities.concat(world.blocks); _i < _a.length; _i++) {
        var attachable = _a[_i];
        if (attachable.x == hover.x && attachable.y == hover.y && attachable.attached) {
            for (var _b = 0, _c = attachable.attached; _b < _c.length; _b++) {
                var pos = _c[_b];
                ctx.beginPath();
                ctx.rect(pos.x * GRID, pos.y * GRID, GRID, GRID);
                ctx.fill();
            }
        }
    }
    var teamNames = Object.keys(st.teams);
    teamNames.sort();
    for (var _d = 0, _e = world.entities; _d < _e.length; _d++) {
        var agent = _e[_d];
        if (Math.abs(agent.x - hover.x) + Math.abs(agent.y - hover.y) <= agent.vision) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = styles.teams[teamNames.indexOf(agent.team)];
            drawArea(ctx, agent.x, agent.y, 5);
        }
    }
}
function renderStatic(canvas, ctx, world) {
    canvas.width = window.innerWidth - 350;
    canvas.height = window.innerHeight;
    GRID = Math.floor(Math.min(canvas.width / world.grid.width, canvas.height / world.grid.height));
    ctx.translate(Math.floor((canvas.width - world.grid.width * GRID) / 2), Math.floor((canvas.height - world.grid.height * GRID) / 2));
    // background
    ctx.beginPath();
    ctx.fillStyle = '#eee';
    ctx.rect(0, 0, world.grid.width * GRID, world.grid.height * GRID);
    ctx.fill();
    // background pattern
    ctx.fillStyle = '#ddd';
    for (var y = 0; y < world.grid.height; y++) {
        for (var x = y % 2; x < world.grid.width; x += 2) {
            ctx.beginPath();
            ctx.rect(x * GRID, y * GRID, GRID, GRID);
            ctx.fill();
        }
    }
}
function rect(ctx, blockSize, x, y, margin) {
    return {
        x1: x * blockSize + margin,
        y1: y * blockSize + margin,
        x2: x * blockSize + blockSize - margin,
        y2: y * blockSize + blockSize - margin,
        width: blockSize - 2 * margin,
        height: blockSize - 2 * margin,
    };
}
function drawBlock(ctx, r, color, light, dark) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(r.x1, r.y1, r.width, r.height);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y2);
    ctx.lineTo(r.x1, r.y1);
    ctx.lineTo(r.x2, r.y1);
    ctx.strokeStyle = light;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r.x2, r.y1);
    ctx.lineTo(r.x2, r.y2);
    ctx.lineTo(r.x1, r.y2);
    ctx.strokeStyle = dark;
    ctx.stroke();
}
function drawRotatedBlock(ctx, r, color, light, dark) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(r.x1, (r.y1 + r.y2) / 2);
    ctx.lineTo((r.x1 + r.x2) / 2, r.y1);
    ctx.lineTo(r.x2, (r.y1 + r.y2) / 2);
    ctx.lineTo((r.x1 + r.x2) / 2, r.y2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r.x1, (r.y1 + r.y2) / 2);
    ctx.lineTo((r.x1 + r.x2) / 2, r.y1);
    ctx.lineTo(r.x2, (r.y1 + r.y2) / 2);
    ctx.strokeStyle = light;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r.x2, (r.y1 + r.y2) / 2);
    ctx.lineTo((r.x1 + r.x2) / 2, r.y2);
    ctx.lineTo(r.x1, (r.y1 + r.y2) / 2);
    ctx.strokeStyle = dark;
    ctx.stroke();
}
function renderBlocks(ctx, st, blocks, blockSize) {
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        ctx.lineWidth = blockSize / 20;
        var r = rect(ctx, blockSize, block.x, block.y, ctx.lineWidth / 2);
        drawBlock(ctx, r, styles.blocks[st.blockTypes.indexOf(block.type) % styles.blocks.length], 'white', 'black');
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(block.type, (block.x + 0.5) * blockSize, (block.y + 0.5) * blockSize);
    }
}
exports.renderBlocks = renderBlocks;
function renderDynamic(ctx, st, dynamic) {
    // terrain
    for (var y = 0; y < st.grid.height; y++) {
        for (var x = 0; x < st.grid.width; x++) {
            switch (dynamic.cells[y][x]) {
                case 0: // EMPTY
                    continue;
                case 1: // GOAL
                    ctx.fillStyle = styles.goalFill;
                    ctx.strokeStyle = styles.goalStroke;
                    ctx.beginPath();
                    ctx.rect(x * GRID, y * GRID, GRID, GRID);
                    ctx.fill();
                    continue;
                case 2: // OBSTABLE
                    ctx.fillStyle = styles.obstacle;
                    break;
            }
            ctx.beginPath();
            ctx.rect(x * GRID, y * GRID, GRID, GRID);
            ctx.fill();
        }
    }
    // dispensers
    for (var _i = 0, _a = dynamic.dispensers; _i < _a.length; _i++) {
        var dispenser = _a[_i];
        ctx.lineWidth = GRID / 20;
        var r1 = rect(ctx, GRID, dispenser.x, dispenser.y, ctx.lineWidth / 2);
        var color = styles.blocks[st.blockTypes.indexOf(dispenser.type) % styles.blocks.length];
        drawBlock(ctx, r1, color, 'white', 'black');
        var r2 = rect(ctx, GRID, dispenser.x, dispenser.y, 4 * ctx.lineWidth / 2);
        drawBlock(ctx, r2, color, 'white', 'black');
        var r3 = rect(ctx, GRID, dispenser.x, dispenser.y, 8 * ctx.lineWidth / 2);
        drawBlock(ctx, r3, color, 'white', 'black');
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText("[" + dispenser.type + "]", (dispenser.x + 0.5) * GRID, (dispenser.y + 0.5) * GRID);
    }
    // blocks
    renderBlocks(ctx, st, dynamic.blocks, GRID);
    // agents
    var teams = Object.keys(st.teams);
    teams.sort();
    for (var _b = 0, _c = dynamic.entities; _b < _c.length; _b++) {
        var agent = _c[_b];
        ctx.beginPath();
        ctx.lineWidth = GRID / 8;
        ctx.moveTo((agent.x + 0.5) * GRID, agent.y * GRID);
        ctx.lineTo((agent.x + 0.5) * GRID, agent.y * GRID + GRID);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = GRID / 8;
        ctx.moveTo(agent.x * GRID, (agent.y + 0.5) * GRID);
        ctx.lineTo(agent.x * GRID + GRID, (agent.y + 0.5) * GRID);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        var color = styles.teams[teams.indexOf(agent.team)];
        if (teams.indexOf(agent.team) == 0) {
            ctx.lineWidth = GRID / 20;
            var margin = GRID * (1 - 15 / 16 / Math.sqrt(2)) / 2;
            var r = rect(ctx, GRID, agent.x, agent.y, margin);
            drawBlock(ctx, r, color, 'white', 'black');
        }
        else {
            ctx.lineWidth = GRID / 25;
            var r = rect(ctx, GRID, agent.x, agent.y, GRID / 16);
            drawRotatedBlock(ctx, r, color, 'white', 'black');
        }
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(shortName(agent), (agent.x + 0.5) * GRID, (agent.y + 0.5) * GRID);
        // clear action
        if (agent.action == 'clear' && agent.actionResult.indexOf("failed_") != 0) {
            var x = agent.x + parseInt(agent.actionParams[0], 10);
            var y = agent.y + parseInt(agent.actionParams[1], 10);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            drawArea(ctx, x, y, 1);
        }
    }
    // clear events
    for (var _d = 0, _e = dynamic.clear; _d < _e.length; _d++) {
        var clear = _e[_d];
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        drawArea(ctx, clear.x, clear.y, clear.radius);
    }
}
function shortName(agent) {
    var match = agent.name.match(/^agent-([A-Za-z])[A-Za-z-_]*([0-9]+)$/);
    return match ? match[1] + match[2] : agent.name;
}
function drawArea(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo((x - radius) * GRID, (y + 0.5) * GRID);
    ctx.lineTo((x + 0.5) * GRID, (y - radius) * GRID);
    ctx.lineTo((x + 1 + radius) * GRID, (y + 0.5) * GRID);
    ctx.lineTo((x + 0.5) * GRID, (y + radius + 1) * GRID);
    ctx.lineTo((x - radius) * GRID, (y + 0.5) * GRID);
    ctx.stroke();
}

},{"./styles":7}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(redraw, replayPath) {
    var vm = {
        state: 'connecting'
    };
    function connect() {
        var protocol = document.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var path = document.location.pathname.substr(0, document.location.pathname.lastIndexOf('/'));
        var ws = new WebSocket(protocol + '//' + document.location.host + path + '/live/monitor');
        ws.onmessage = function (msg) {
            var data = JSON.parse(msg.data);
            console.log(data);
            if (data.grid) {
                data.blockTypes.sort();
                vm.static = data;
            }
            else
                vm.dynamic = data;
            redraw();
        };
        ws.onopen = function () {
            console.log('Connected');
            vm.state = 'online';
            redraw();
        };
        ws.onclose = function () {
            console.log('Disconnected');
            setTimeout(connect, 5000);
            vm.state = 'offline';
            redraw();
        };
    }
    var makeReplayCtrl = function (path) {
        if (path[path.length - 1] == '/')
            path = path.substr(0, path.length - 1);
        var suffix = location.pathname == '/' ? "?sri=" + Math.random().toString(36).slice(-8) : '';
        var step = -1;
        var timer = undefined;
        var cache = {};
        var cacheSize = 0;
        function stop() {
            if (timer)
                clearInterval(timer);
            timer = undefined;
            redraw();
        }
        function start() {
            if (!timer)
                timer = setInterval(function () {
                    if (vm.state !== 'connecting')
                        setStep(step + 1);
                }, 1000);
            redraw();
        }
        function loadStatic() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', path + "/static.json" + suffix);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    vm.static = JSON.parse(xhr.responseText);
                    setStep(step);
                }
                else {
                    vm.state = 'error';
                }
                redraw();
            };
            xhr.onerror = function () {
                vm.state = 'error';
                redraw();
            };
            xhr.send();
        }
        function loadDynamic(step) {
            // got from cache
            if (cache[step]) {
                vm.dynamic = cache[step];
                vm.state = (vm.dynamic && vm.dynamic.step == step) ? 'online' : 'connecting';
                redraw();
                return;
            }
            var group = step > 0 ? Math.floor(step / 5) * 5 : 0;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', path + "/" + group + ".json" + suffix);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    vm.dynamic = response[step];
                    vm.state = (vm.dynamic && vm.dynamic.step == step) ? 'online' : 'connecting';
                    // write to cache
                    if (cacheSize > 100) {
                        cache = {};
                        cacheSize = 0;
                    }
                    for (var s in response) {
                        cache[s] = response[s];
                        cacheSize++;
                    }
                }
                else {
                    vm.state = 'error';
                    stop();
                }
                redraw();
            };
            xhr.onerror = function () {
                vm.state = 'error';
                stop();
                redraw();
            };
            xhr.send();
        }
        function setStep(s) {
            // keep step in bounds
            step = Math.max(-1, s);
            if (vm.static && step >= vm.static.steps) {
                stop();
                step = vm.static.steps - 1;
            }
            // show connecting after a while
            vm.state = 'connecting';
            setTimeout(function () { return redraw(); }, 500);
            // update url
            if (history.replaceState)
                history.replaceState({}, document.title, '#' + step);
            loadDynamic(step);
        }
        loadStatic();
        return {
            name: function () {
                var parts = path.split('/');
                return parts[parts.length - 1];
            },
            step: function () {
                return step;
            },
            setStep: setStep,
            toggle: function () {
                if (timer)
                    stop();
                else
                    start();
            },
            stop: stop,
            start: start,
            playing: function () {
                return !!timer;
            }
        };
    };
    var replay = replayPath ? makeReplayCtrl(replayPath) : undefined;
    if (!replay)
        connect();
    return {
        replay: replay,
        vm: vm,
        redraw: redraw,
        setHover: function (pos) {
            var changed = (!pos && vm.hover) || (pos && !vm.hover) || (pos && vm.hover && (pos.x != vm.hover.x || pos.y != vm.hover.y));
            vm.hover = pos;
            if (changed)
                redraw();
        }
    };
}
exports.default = default_1;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var snabbdom_1 = require("snabbdom");
var class_1 = require("snabbdom/modules/class");
var props_1 = require("snabbdom/modules/props");
var attributes_1 = require("snabbdom/modules/attributes");
var eventlisteners_1 = require("snabbdom/modules/eventlisteners");
var style_1 = require("snabbdom/modules/style");
var ctrl_1 = require("./ctrl");
var canvas_1 = require("./canvas");
var overlay_1 = require("./overlay");
var statusCtrl_1 = require("./statusCtrl");
var statusView_1 = require("./statusView");
var patch = snabbdom_1.init([class_1.default, props_1.default, attributes_1.default, eventlisteners_1.default, style_1.default]);
function Monitor(overlayTarget, canvas) {
    var vnode = overlayTarget;
    var ctrl;
    var redrawRequested = false;
    var redraw = function () {
        if (redrawRequested)
            return;
        redrawRequested = true;
        requestAnimationFrame(function () {
            redrawRequested = false;
            vnode = patch(vnode, overlay_1.default(ctrl));
            canvas_1.render(canvas, ctrl);
        });
    };
    var hashChange = function () {
        if (ctrl.replay) {
            var step = parseInt(document.location.hash.substr(1), 10);
            if (step > 0)
                ctrl.replay.setStep(step);
            else if (!document.location.hash)
                ctrl.replay.start();
        }
    };
    var replayPath = window.location.search.length > 1 ? window.location.search.substr(1) : undefined;
    ctrl = ctrl_1.default(redraw, replayPath);
    hashChange();
    window.onhashchange = hashChange;
    redraw();
    window.addEventListener('resize', redraw, { passive: true });
    canvas.addEventListener('mousemove', function (e) {
        if (!ctrl.vm.static)
            return;
        ctrl.setHover(canvas_1.invClientPos(canvas, ctrl.vm.static, e.clientX, e.clientY));
    });
    canvas.addEventListener('mouseleave', function (e) {
        ctrl.setHover(undefined);
    });
}
exports.default = Monitor;
function Status(target) {
    var vnode = target;
    var ctrl;
    var redrawRequested = false;
    var redraw = function () {
        if (redrawRequested)
            return;
        redrawRequested = true;
        requestAnimationFrame(function () {
            redrawRequested = false;
            vnode = patch(vnode, statusView_1.default(ctrl));
        });
    };
    ctrl = statusCtrl_1.default(redraw);
    redraw();
}
exports.Status = Status;

},{"./canvas":1,"./ctrl":2,"./overlay":4,"./statusCtrl":5,"./statusView":6,"snabbdom":16,"snabbdom/modules/attributes":11,"snabbdom/modules/class":12,"snabbdom/modules/eventlisteners":13,"snabbdom/modules/props":14,"snabbdom/modules/style":15}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_1 = require("./canvas");
var styles = require("./styles");
var snabbdom_1 = require("snabbdom");
function replay(ctrl) {
    return snabbdom_1.h('div.box.replay', [
        snabbdom_1.h('div', [snabbdom_1.h('strong', 'Replay:'), ' ', ctrl.name()]),
        snabbdom_1.h('div', [
            snabbdom_1.h('button', { on: { click: function () { return ctrl.setStep(-1); } } }, '|<<'),
            snabbdom_1.h('button', { on: { click: function () { return ctrl.setStep(ctrl.step() - 10); } } }, '<<'),
            snabbdom_1.h('button', {
                on: { click: function () { return ctrl.toggle(); } }
            }, ctrl.playing() ? '||' : '>'),
            snabbdom_1.h('button', { on: { click: function () { return ctrl.setStep(ctrl.step() + 10); } } }, '>>'),
            snabbdom_1.h('button', { on: { click: function () { return ctrl.setStep(99999999); } } }, '>>|')
        ])
    ]);
}
function simplePlural(n, singular) {
    if (n === 1)
        return '1 ' + singular;
    else
        return n + ' ' + singular + 's';
}
function teams(st, world) {
    var teamNames = Object.keys(st.teams);
    teamNames.sort();
    return teamNames.map(function (name, i) { return snabbdom_1.h('div.team', {
        style: { background: styles.teams[i] }
    }, name + ": $" + world.scores[name]); });
}
function tasks(ctrl, st, world) {
    var selectedTask = world.tasks.filter(function (t) { return t.name === ctrl.vm.taskName; })[0];
    return [
        snabbdom_1.h('select', {
            on: {
                change: function (e) {
                    ctrl.vm.taskName = e.target.value;
                    ctrl.redraw();
                }
            }
        }, [
            snabbdom_1.h('option', {
                props: {
                    value: ''
                },
            }, simplePlural(world.tasks.length, 'task'))
        ].concat(world.tasks.map(function (t) { return snabbdom_1.h('option', {
            props: {
                value: t.name
            },
        }, t.reward + "$ for " + t.name + " until step " + t.deadline); })))
    ].concat((selectedTask ? taskDetails(st, selectedTask) : []));
}
function hover(world, pos) {
    if (!world.cells[pos.y])
        return;
    var terrain = world.cells[pos.y][pos.x];
    if (typeof terrain == 'undefined')
        return;
    // pos
    var r = [snabbdom_1.h('li', "x = " + pos.x + ", y = " + pos.y)];
    // terrain
    if (terrain === 0)
        r.push(snabbdom_1.h('li', 'terrain: empty'));
    else if (terrain === 1)
        r.push(snabbdom_1.h('li', 'terrain: goal'));
    else if (terrain === 2)
        r.push(snabbdom_1.h('li', 'terrain: obstacle'));
    // dispensers
    for (var _i = 0, _a = world.dispensers; _i < _a.length; _i++) {
        var dispenser = _a[_i];
        if (dispenser.x == pos.x && dispenser.y == pos.y) {
            r.push(snabbdom_1.h('li', "dispenser: type = " + dispenser.type));
        }
    }
    // blocks
    for (var _b = 0, _c = world.blocks; _b < _c.length; _b++) {
        var block = _c[_b];
        if (block.x == pos.x && block.y == pos.y) {
            r.push(snabbdom_1.h('li', "block: type = " + block.type));
        }
    }
    // agents
    for (var _d = 0, _e = world.entities; _d < _e.length; _d++) {
        var agent = _e[_d];
        if (agent.x == pos.x && agent.y == pos.y) {
            var description = "agent: name = " + agent.name + ", team = " + agent.team + ", energy = " + agent.energy + ", " + agent.action + "(\u2026) = " + agent.actionResult;
            if (agent.disabled)
                description += ', disabled';
            r.push(snabbdom_1.h('li', description));
        }
    }
    return snabbdom_1.h('ul', r);
}
function taskDetails(st, task) {
    var xs = task.requirements.map(function (b) { return Math.abs(b.x); });
    var ys = task.requirements.map(function (b) { return Math.abs(b.y); });
    var width = 2 * Math.max.apply(Math, xs) + 1;
    var height = 2 * Math.max.apply(Math, ys) + 1;
    var elementWidth = 318;
    var gridSize = Math.min(Math.floor(elementWidth / width), 50);
    var elementHeight = gridSize * height;
    var render = function (vnode) {
        var canvas = vnode.elm;
        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate((elementWidth - gridSize) / 2, (elementHeight - gridSize) / 2);
        ctx.beginPath();
        ctx.rect(gridSize * 0.4, gridSize * 0.4, gridSize * 0.2, gridSize * 0.2);
        ctx.fillStyle = 'red';
        ctx.fill();
        canvas_1.renderBlocks(ctx, st, task.requirements, gridSize);
        ctx.restore();
    };
    return [snabbdom_1.h('canvas', {
            props: {
                width: elementWidth,
                height: elementHeight
            },
            hook: {
                insert: render,
                update: function (_, vnode) { return render(vnode); }
            }
        }), snabbdom_1.h('p', simplePlural(task.requirements.length, 'block'))];
}
function disconnected() {
    return snabbdom_1.h('div.box', [
        snabbdom_1.h('p', 'Live server not connected.'),
        snabbdom_1.h('a', {
            props: { href: document.location.pathname + document.location.search }
        }, 'Retry now.')
    ]);
}
function box(child) {
    return child ? snabbdom_1.h('div.box', child) : undefined;
}
function default_1(ctrl) {
    return snabbdom_1.h('div#overlay', [
        ctrl.vm.static && (ctrl.replay ? replay(ctrl.replay) : snabbdom_1.h('div.box', ctrl.vm.static.sim)),
        (ctrl.vm.state === 'error' || ctrl.vm.state === 'offline') ?
            ctrl.replay ?
                snabbdom_1.h('div.box', ctrl.vm.static ? 'Could not load step' : 'Could not load replay') :
                disconnected() : undefined,
        (ctrl.vm.static && ctrl.vm.dynamic) ?
            snabbdom_1.h('div.box', [
                "Step: " + ctrl.vm.dynamic.step + " / " + (ctrl.vm.static.steps - 1)
            ]) : undefined,
        ctrl.vm.state === 'connecting' ? snabbdom_1.h('div.box', [snabbdom_1.h('div.loader', 'Loading ...')]) : undefined
    ].concat(((ctrl.vm.state === 'online' && ctrl.vm.static && ctrl.vm.dynamic) ? [
        snabbdom_1.h('div.box', teams(ctrl.vm.static, ctrl.vm.dynamic)),
        snabbdom_1.h('div.box', tasks(ctrl, ctrl.vm.static, ctrl.vm.dynamic)),
        ctrl.vm.hover ? box(hover(ctrl.vm.dynamic, ctrl.vm.hover)) : undefined
    ] : [])));
}
exports.default = default_1;

},{"./canvas":1,"./styles":7,"snabbdom":16}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(redraw) {
    var vm = {
        state: 'connecting'
    };
    function connect() {
        var protocol = document.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var path = document.location.pathname.substr(0, document.location.pathname.lastIndexOf('/'));
        var ws = new WebSocket(protocol + '//' + document.location.host + path + '/live/status');
        ws.onmessage = function (msg) {
            var data = JSON.parse(msg.data);
            console.log(data);
            vm.data = data;
            redraw();
        };
        ws.onopen = function () {
            console.log('Connected');
            vm.state = 'online';
            redraw();
        };
        ws.onclose = function () {
            console.log('Disconnected');
            setTimeout(connect, 5000);
            vm.data = undefined;
            vm.state = 'offline';
            redraw();
        };
    }
    connect();
    return {
        vm: vm,
        redraw: redraw
    };
}
exports.default = default_1;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var snabbdom_1 = require("snabbdom");
var styles = require("./styles");
function compare(a, b) {
    if (a.team < b.team)
        return -1;
    else if (a.team > b.team)
        return 1;
    var suffixA = parseInt(a.name.replace(/^[^\d]*/, ''), 10);
    var suffixB = parseInt(b.name.replace(/^[^\d]*/, ''), 10);
    if (suffixA < suffixB)
        return -1;
    else if (suffixA > suffixB)
        return 1;
    if (a.name < b.name)
        return -1;
    else if (a.name > b.name)
        return 1;
    else
        return 0;
}
function view(data) {
    data.entities.sort(compare);
    var teams = [];
    for (var _i = 0, _a = data.entities; _i < _a.length; _i++) {
        var entity = _a[_i];
        if (teams.indexOf(entity.team) == -1)
            teams.push(entity.team);
    }
    return [
        snabbdom_1.h('h2', "Step " + data.step + "/" + (data.steps - 1)),
        snabbdom_1.h('table', [
            snabbdom_1.h('thead', [
                snabbdom_1.h('tr', [
                    snabbdom_1.h('th', 'Team'),
                    snabbdom_1.h('th', 'Agent'),
                    snabbdom_1.h('th', 'Last action'),
                    snabbdom_1.h('th', 'Last action result')
                ])
            ]),
            snabbdom_1.h('tbody', data.entities.map(function (entity) {
                var teamColors = { style: { background: styles.teams[teams.indexOf(entity.team)] } };
                return snabbdom_1.h('tr', [
                    snabbdom_1.h('td', teamColors, entity.team),
                    snabbdom_1.h('td', teamColors, entity.name),
                    snabbdom_1.h('td', { attrs: { class: entity.action } }, entity.action),
                    snabbdom_1.h('td', { attrs: { class: entity.actionResult } }, entity.actionResult)
                ]);
            }))
        ])
    ];
}
function default_1(ctrl) {
    return snabbdom_1.h('div#status', [
        snabbdom_1.h('h1', ['Status: ', ctrl.vm.data ? ctrl.vm.data.sim : ctrl.vm.state])
    ].concat((ctrl.vm.data ? view(ctrl.vm.data) : [])));
}
exports.default = default_1;

},{"./styles":7,"snabbdom":16}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teams = ['blue', 'green', '#ff1493', '#8b0000'];
exports.goalStroke = 'red';
exports.goalFill = 'rgba(255, 0, 0, 0.4)';
exports.obstacle = '#333';
exports.blocks = ['#41470b', '#78730d', '#bab217', '#e3d682', '#b3a06f', '#9c7640', '#5a4c35'];

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vnode_1 = require("./vnode");
var is = require("./is");
function addNS(data, children, sel) {
    data.ns = 'http://www.w3.org/2000/svg';
    if (sel !== 'foreignObject' && children !== undefined) {
        for (var i = 0; i < children.length; ++i) {
            var childData = children[i].data;
            if (childData !== undefined) {
                addNS(childData, children[i].children, children[i].sel);
            }
        }
    }
}
function h(sel, b, c) {
    var data = {}, children, text, i;
    if (c !== undefined) {
        data = b;
        if (is.array(c)) {
            children = c;
        }
        else if (is.primitive(c)) {
            text = c;
        }
        else if (c && c.sel) {
            children = [c];
        }
    }
    else if (b !== undefined) {
        if (is.array(b)) {
            children = b;
        }
        else if (is.primitive(b)) {
            text = b;
        }
        else if (b && b.sel) {
            children = [b];
        }
        else {
            data = b;
        }
    }
    if (children !== undefined) {
        for (i = 0; i < children.length; ++i) {
            if (is.primitive(children[i]))
                children[i] = vnode_1.vnode(undefined, undefined, undefined, children[i], undefined);
        }
    }
    if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
        (sel.length === 3 || sel[3] === '.' || sel[3] === '#')) {
        addNS(data, children, sel);
    }
    return vnode_1.vnode(sel, data, children, text, undefined);
}
exports.h = h;
;
exports.default = h;

},{"./is":10,"./vnode":18}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createElement(tagName) {
    return document.createElement(tagName);
}
function createElementNS(namespaceURI, qualifiedName) {
    return document.createElementNS(namespaceURI, qualifiedName);
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createComment(text) {
    return document.createComment(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
    node.removeChild(child);
}
function appendChild(node, child) {
    node.appendChild(child);
}
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
exports.htmlDomApi = {
    createElement: createElement,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
    isComment: isComment,
};
exports.default = exports.htmlDomApi;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var colonChar = 58;
var xChar = 120;
function updateAttrs(oldVnode, vnode) {
    var key, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs;
    if (!oldAttrs && !attrs)
        return;
    if (oldAttrs === attrs)
        return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            }
            else if (cur === false) {
                elm.removeAttribute(key);
            }
            else {
                if (key.charCodeAt(0) !== xChar) {
                    elm.setAttribute(key, cur);
                }
                else if (key.charCodeAt(3) === colonChar) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                }
                else if (key.charCodeAt(5) === colonChar) {
                    // Assume xlink namespace
                    elm.setAttributeNS(xlinkNS, key, cur);
                }
                else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
    // remove removed attributes
    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
    // the other option is to remove all attributes with value == undefined
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}
exports.attributesModule = { create: updateAttrs, update: updateAttrs };
exports.default = exports.attributesModule;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateClass(oldVnode, vnode) {
    var cur, name, elm = vnode.elm, oldClass = oldVnode.data.class, klass = vnode.data.class;
    if (!oldClass && !klass)
        return;
    if (oldClass === klass)
        return;
    oldClass = oldClass || {};
    klass = klass || {};
    for (name in oldClass) {
        if (!klass[name]) {
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        cur = klass[name];
        if (cur !== oldClass[name]) {
            elm.classList[cur ? 'add' : 'remove'](name);
        }
    }
}
exports.classModule = { create: updateClass, update: updateClass };
exports.default = exports.classModule;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function invokeHandler(handler, vnode, event) {
    if (typeof handler === "function") {
        // call function handler
        handler.call(vnode, event, vnode);
    }
    else if (typeof handler === "object") {
        // call handler with arguments
        if (typeof handler[0] === "function") {
            // special case for single argument for performance
            if (handler.length === 2) {
                handler[0].call(vnode, handler[1], event, vnode);
            }
            else {
                var args = handler.slice(1);
                args.push(event);
                args.push(vnode);
                handler[0].apply(vnode, args);
            }
        }
        else {
            // call multiple handlers
            for (var i = 0; i < handler.length; i++) {
                invokeHandler(handler[i], vnode, event);
            }
        }
    }
}
function handleEvent(event, vnode) {
    var name = event.type, on = vnode.data.on;
    // call event handler(s) if exists
    if (on && on[name]) {
        invokeHandler(on[name], vnode, event);
    }
}
function createListener() {
    return function handler(event) {
        handleEvent(event, handler.vnode);
    };
}
function updateEventListeners(oldVnode, vnode) {
    var oldOn = oldVnode.data.on, oldListener = oldVnode.listener, oldElm = oldVnode.elm, on = vnode && vnode.data.on, elm = (vnode && vnode.elm), name;
    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }
    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                oldElm.removeEventListener(name, oldListener, false);
            }
        }
        else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }
    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        var listener = vnode.listener = oldVnode.listener || createListener();
        // update vnode for listener
        listener.vnode = vnode;
        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        }
        else {
            for (name in on) {
                // add listener if new listener added
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}
exports.eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners
};
exports.default = exports.eventListenersModule;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateProps(oldVnode, vnode) {
    var key, cur, old, elm = vnode.elm, oldProps = oldVnode.data.props, props = vnode.data.props;
    if (!oldProps && !props)
        return;
    if (oldProps === props)
        return;
    oldProps = oldProps || {};
    props = props || {};
    for (key in oldProps) {
        if (!props[key]) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];
        if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
            elm[key] = cur;
        }
    }
}
exports.propsModule = { create: updateProps, update: updateProps };
exports.default = exports.propsModule;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Bindig `requestAnimationFrame` like this fixes a bug in IE/Edge. See #360 and #409.
var raf = (typeof window !== 'undefined' && (window.requestAnimationFrame).bind(window)) || setTimeout;
var nextFrame = function (fn) { raf(function () { raf(fn); }); };
var reflowForced = false;
function setNextFrame(obj, prop, val) {
    nextFrame(function () { obj[prop] = val; });
}
function updateStyle(oldVnode, vnode) {
    var cur, name, elm = vnode.elm, oldStyle = oldVnode.data.style, style = vnode.data.style;
    if (!oldStyle && !style)
        return;
    if (oldStyle === style)
        return;
    oldStyle = oldStyle || {};
    style = style || {};
    var oldHasDel = 'delayed' in oldStyle;
    for (name in oldStyle) {
        if (!style[name]) {
            if (name[0] === '-' && name[1] === '-') {
                elm.style.removeProperty(name);
            }
            else {
                elm.style[name] = '';
            }
        }
    }
    for (name in style) {
        cur = style[name];
        if (name === 'delayed' && style.delayed) {
            for (var name2 in style.delayed) {
                cur = style.delayed[name2];
                if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
                    setNextFrame(elm.style, name2, cur);
                }
            }
        }
        else if (name !== 'remove' && cur !== oldStyle[name]) {
            if (name[0] === '-' && name[1] === '-') {
                elm.style.setProperty(name, cur);
            }
            else {
                elm.style[name] = cur;
            }
        }
    }
}
function applyDestroyStyle(vnode) {
    var style, name, elm = vnode.elm, s = vnode.data.style;
    if (!s || !(style = s.destroy))
        return;
    for (name in style) {
        elm.style[name] = style[name];
    }
}
function applyRemoveStyle(vnode, rm) {
    var s = vnode.data.style;
    if (!s || !s.remove) {
        rm();
        return;
    }
    if (!reflowForced) {
        getComputedStyle(document.body).transform;
        reflowForced = true;
    }
    var name, elm = vnode.elm, i = 0, compStyle, style = s.remove, amount = 0, applied = [];
    for (name in style) {
        applied.push(name);
        elm.style[name] = style[name];
    }
    compStyle = getComputedStyle(elm);
    var props = compStyle['transition-property'].split(', ');
    for (; i < props.length; ++i) {
        if (applied.indexOf(props[i]) !== -1)
            amount++;
    }
    elm.addEventListener('transitionend', function (ev) {
        if (ev.target === elm)
            --amount;
        if (amount === 0)
            rm();
    });
}
function forceReflow() {
    reflowForced = false;
}
exports.styleModule = {
    pre: forceReflow,
    create: updateStyle,
    update: updateStyle,
    destroy: applyDestroyStyle,
    remove: applyRemoveStyle
};
exports.default = exports.styleModule;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vnode_1 = require("./vnode");
var is = require("./is");
var htmldomapi_1 = require("./htmldomapi");
function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }
var emptyNode = vnode_1.default('', {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode) {
    return vnode.sel !== undefined;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i, map = {}, key, ch;
    for (i = beginIdx; i <= endIdx; ++i) {
        ch = children[i];
        if (ch != null) {
            key = ch.key;
            if (key !== undefined)
                map[key] = i;
        }
    }
    return map;
}
var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
var h_1 = require("./h");
exports.h = h_1.h;
var thunk_1 = require("./thunk");
exports.thunk = thunk_1.thunk;
function init(modules, domApi) {
    var i, j, cbs = {};
    var api = domApi !== undefined ? domApi : htmldomapi_1.default;
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                cbs[hooks[i]].push(hook);
            }
        }
    }
    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return vnode_1.default(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                var parent_1 = api.parentNode(childElm);
                api.removeChild(parent_1, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var i, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
                data = vnode.data;
            }
        }
        var children = vnode.children, sel = vnode.sel;
        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);
        }
        else if (sel !== undefined) {
            // Parse selector
            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.', hashIdx);
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                : api.createElement(tag);
            if (hash < dot)
                elm.setAttribute('id', sel.slice(hash + 1, dot));
            if (dotIdx > 0)
                elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            if (is.array(children)) {
                for (i = 0; i < children.length; ++i) {
                    var ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (is.primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (i.create)
                    i.create(emptyNode, vnode);
                if (i.insert)
                    insertedVnodeQueue.push(vnode);
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var i, j, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.destroy))
                i(vnode);
            for (i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (j = 0; j < vnode.children.length; ++j) {
                    i = vnode.children[j];
                    if (i != null && typeof i !== "string") {
                        invokeDestroyHook(i);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
                        cbs.remove[i_1](ch, rm);
                    if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                        i_1(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0, newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx;
        var idxInOld;
        var elmToMove;
        var before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
            if (oldStartIdx > oldEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            else {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;
        if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
            i(oldVnode, vnode);
        }
        var elm = vnode.elm = oldVnode.elm;
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            i = vnode.data.hook;
            if (isDef(i) && isDef(i = i.update))
                i(oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            }
            else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, '');
            }
        }
        else if (oldVnode.text !== vnode.text) {
            if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            api.setTextContent(elm, vnode.text);
        }
        if (isDef(hook) && isDef(i = hook.postpatch)) {
            i(oldVnode, vnode);
        }
    }
    return function patch(oldVnode, vnode) {
        var i, elm, parent;
        var insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i)
            cbs.pre[i]();
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}
exports.init = init;

},{"./h":8,"./htmldomapi":9,"./is":10,"./thunk":17,"./vnode":18}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var h_1 = require("./h");
function copyToThunk(vnode, thunk) {
    thunk.elm = vnode.elm;
    vnode.data.fn = thunk.data.fn;
    vnode.data.args = thunk.data.args;
    thunk.data = vnode.data;
    thunk.children = vnode.children;
    thunk.text = vnode.text;
    thunk.elm = vnode.elm;
}
function init(thunk) {
    var cur = thunk.data;
    var vnode = cur.fn.apply(undefined, cur.args);
    copyToThunk(vnode, thunk);
}
function prepatch(oldVnode, thunk) {
    var i, old = oldVnode.data, cur = thunk.data;
    var oldArgs = old.args, args = cur.args;
    if (old.fn !== cur.fn || oldArgs.length !== args.length) {
        copyToThunk(cur.fn.apply(undefined, args), thunk);
        return;
    }
    for (i = 0; i < args.length; ++i) {
        if (oldArgs[i] !== args[i]) {
            copyToThunk(cur.fn.apply(undefined, args), thunk);
            return;
        }
    }
    copyToThunk(oldVnode, thunk);
}
exports.thunk = function thunk(sel, key, fn, args) {
    if (args === undefined) {
        args = fn;
        fn = key;
        key = undefined;
    }
    return h_1.h(sel, {
        key: key,
        hook: { init: init, prepatch: prepatch },
        fn: fn,
        args: args
    });
};
exports.default = exports.thunk;

},{"./h":8}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
exports.default = vnode;

},{}]},{},[3])(3)
});
