

// append elements to drawer
for (var i = 0; i < Object.keys(components).length; i++) {

  var os = Object.keys(components)[i]; // os = object section
  section(components[os].name);
  createGrid("d" + os); // d = drawer
  for (var j = 1; j < Object.keys(components[os]).length; j++) {
    var object = Object.keys(components[os])[j];
    var elem = components[os][object];
    addLabel(elem.name, appendElement(object, "d" + os), true);
  }
}

// create drawer section
function section(name) {
  var div = document.createElement("div");
  div.classList.add("section");
  div.innerHTML = name;
  div.addEventListener('click', sectionClick);
  document.getElementById("drawer").appendChild(div);
}
function sectionClick() {
  var drawer = document.getElementById('drawer');
  for (var i = 0; i < drawer.children.length; i++) {
    if (drawer.children[i] === this.closest('div')) {
      var section = drawer.children[i + 1];
      if (section.style.display !== 'none') {
        drawer.children[i].style.opacity = '0.6';
        // section.style.height = '100px';
        section.style.opacity = 0;
        section.style.gridGap = 0;
        setTimeout(function () {
          section.style.display = 'none';
        }, 200);
      } else {
        drawer.children[i].style.opacity = '';
        section.style.display = '';
        setTimeout(function () {
          section.style.opacity = '';
          section.style.gridGap = '25px 0';
        }, 10);
      }
    }
  }
}

// create drawer grid
function createGrid(name) {
  var div = document.createElement("div");
  div.id = name;
  div.classList.add("grid");
  document.getElementById("drawer").appendChild(div);
}


///// GET LOCALSTORAGE /////

if (localStorage.lineType !== undefined) setting_lineType = localStorage.lineType;
if (localStorage.lineColor_idle !== undefined) setting_lineColor_idle = localStorage.lineColor_idle;
if (localStorage.lineColor_powered !== undefined) setting_lineColor_powered = localStorage.lineColor_powered;
if (localStorage.theme !== undefined) setting_theme = localStorage.theme;
if (localStorage.background !== undefined) setting_background = localStorage.background;

///// BUTTONS /////

var query = document.querySelectorAll("i");
for (var i = 0; i < query.length; i++) query[i].addEventListener('click', btnClick);
function btnClick() {
  if (this.getAttribute('disabled') == null) {
    var id = this.innerText;
    switch (id) {
      // top
      case 'save':
        save();
        break;
      case 'cloud_download':
        save(undefined, true);
        break;
      case 'folder_open':
        importFile();
        break;
      case 'access_time':
        this.classList.toggle('active');
        document.getElementById('timers').classList.toggle('hidden');
        if (document.getElementById('timers').classList.contains('hidden')) document.getElementById('bottomActions').style.right = null;
        else document.getElementById('bottomActions').style.right = document.querySelector('.right_menu').offsetWidth + 20 + 'px';
        break;

      case 'undo':
      // TODO: undo is not working properly (redo is!)
        if (historyLog.length > 1) {
          var h = historyLog[historyLog.length - 2];
          if (h.type == 'componentMove' || h.type == 'componentAdd') {
            var elem = h.values.elem;
            // if (elem !== undefined)
            elem.style.left = h.values.left;
            elem.style.top = h.values.top;
            elem.style.zIndex = h.values.zIndex;
            console.log(elem);
          }
        }
        var h2 = historyLog[historyLog.length - 1];
        if (h2.type == 'componentAdd') h2.values.elem.remove();
        historyRedo.push(h2);
        if (historyRedo.length > 0) getIcon('redo').removeAttribute('disabled');
        historyLog.pop();
        if (historyLog.length == 0) getIcon('undo').setAttribute('disabled', '');
        break;
      case 'redo':
        if (historyRedo.length > 0) {
          var r = historyRedo[historyRedo.length - 1];
          if (r.type == 'componentAdd') { // history
            var newElem = appendElem(r.values);
            for (var i = 0; i < historyLog.length; i++) {
              if (historyLog[i].values.elem === r.values.elem) historyLog[i].values.elem = newElem;
            }
            for (var j = 0; j < historyRedo.length; j++) {
              if (historyRedo[j].values.elem === r.values.elem) historyRedo[j].values.elem = newElem;
            }
          }
          if (r.type == 'componentMove' || r.type == 'componentAdd') {
            var elem = r.values.elem;
            // if (elem !== undefined)
            elem.style.left = r.values.left;
            elem.style.top = r.values.top;
            elem.style.zIndex = r.values.zIndex;
            console.log(elem);
          }
          historyLog.push(r);
          if (historyLog.length > 0) getIcon('undo').removeAttribute('disabled');
          historyRedo.pop();
          if (historyRedo.length == 0) getIcon('redo').setAttribute('disabled', '');
        }
        break;

      case 'delete':
        deleteSelected();
        break;
      case 'filter_none':
        // duplicate
        break;
      case 'rotate_right':
      case 'rotate_left':
        var selected = document.querySelectorAll('.selected');
        for (var i = 0; i < selected.length; i++) {
          var rotated = 0;
          if (selected[i].style.transform !== null) rotated = Number(selected[i].style.transform.replace(/[^0-9-]+/g,""));
          var rotate = rotated + 90;
          if (id == 'rotate_left') rotate -= 180;
          selected[i].style.transform = 'rotate(' + rotate + 'deg)';
        }
        break;
      case 'post_add':
        // integrated circuit
        break;

      case 'bug_report':
        // outdated
        var query = activeMain().querySelectorAll('.component');
        var output = '';
        var counter = {};
        var lineHelper = {};
        for (var i = 0; i < query.length; i++) {
          var component = query[i];
          var type = component.children[0].classList[0];
          if (counter[type] == undefined) counter[type] = 0;
          counter[type]++;
          var varName = type;
          if (varName.length > 3) varName = type.charAt(0);
          var label = '';
          lineHelper[varName + counter[type]] = {};
          lineHelper[varName + counter[type]].component = component;
          if (component.querySelector('.label') !== null) label = ", '" + component.querySelector('.label').innerHTML + "'";
          output += 'var ' + varName + counter[type] + " = appendElem('" + type + "', {x: " + getNumber(component.style.left) + ", y: " + getNumber(component.style.top) + "}" + label + ");\n";
        }
        var lines = activeMain().querySelectorAll('.lineSVG');
        for (var j = 0; j < lines.length; j++) {
          var line = lines[j].children[1];
          var lineId = getLineConnectors(line);
          var to = '', from = '';

          var lineHelp = Object.keys(lineHelper);
          for (var k = 0; k < lineHelp.length; k++) {
            var typeId = lineHelp[k];
            var component = lineHelper[typeId].component;
            var connectors = component.querySelectorAll('.connector');
            var toFrom = false;

            for (var l = 0; l < connectors.length; l++) {
              if (connectors[l].id == lineId.from) {
                toFrom = 'from';
                break;
              } else if (connectors[l].id == lineId.to) {
                toFrom = 'to';
                break;
              }
            }
            if (toFrom !== false) {
              // var side = '';
              // if (getSignalMap(component).left.count == 0) side = ', side: ' + connectors[l].closest('.').classList[1];
              var side = ", side: '" + connectors[l].closest('.').classList[1] + "'";
              var pos = '';
              if (l - 1 > 0) pos = ", pos: " + (l - 1);
              if (toFrom == 'from') from = "{elem: " + typeId + side + pos + "}";
              else if (toFrom == 'to') to = "{elem: " + typeId + side + pos + "}";
            }
          }
          // TODO: transistor & toggle == t1
          output += "cSVG(" + from + ", " + to + ");\n";
        }
        console.log(output);
        break;

      // top right
      case "widgets":
        document.getElementById("dark").classList.remove("hidden");
        document.getElementById("modes").classList.remove("hidden");
        break;
      case "settings_gear":
        document.getElementById("dark").classList.remove("hidden");
        document.getElementById("settings").classList.remove("hidden");
        break;
      case "info":
        document.getElementById("dark").classList.remove("hidden");
        document.getElementById("info").classList.remove("hidden");
        break;

      // general
      case "close":
        if (!this.classList.contains('tabber')) {
          document.getElementById("dark").classList.add("hidden");
          this.closest('.card').classList.add('hidden');
        }
        break;

      // bottom
      case 'stop':
        var play = getIcon('pause');
        if (play !== undefined) {
          play.innerHTML = 'play_arrow';
          play.title = 'Resume Simulation';
        }
        enable(['fast_forward', 'fast_rewind'], true);
        break;
      case 'pause':
        this.innerHTML = 'play_arrow';
        this.title = 'Resume Simulation';
        enable(['fast_forward', 'fast_rewind'], true);
        break;
      case 'play_arrow':
        this.innerHTML = 'pause';
        this.title = 'Pause Simulation';
        enable(['fast_forward', 'fast_rewind'], false);
        break;
      case 'home':
        home();
        break;
      case 'add':
        if (this.classList.contains('tabber')) {
          var count = document.getElementById('tabber').querySelectorAll('.tab').length;
          addTab('unnamed_' + count);
        }
        else {
          document.getElementById('zoomSlider').value = Number(document.getElementById('zoomSlider').value) + 20;
          sliderChange();
        }
        break;
      case 'remove':
        document.getElementById('zoomSlider').value = Number(document.getElementById('zoomSlider').value) - 20;
        sliderChange();
        break;
      default:
        alert(id);
    }
  }
}

// enable or disable a button
function enable(nameQuery, enable) {
  var query = document.querySelectorAll('.material-icons');
  for (var i = 0; i < query.length; i++)
    for (var j = 0; j < nameQuery.length; j++)
      if (query[i].innerText == nameQuery[j]) {
        if (enable) query[i].removeAttribute('disabled');
        else query[i].setAttribute('disabled', '');
      }
}

// get material icon element by name
function getIcon(name) {
  var query = document.querySelectorAll('.material-icons');
  for (var i = 0; i < query.length; i++)
    if (query[i].innerText == name) return query[i];
}

///// SETTINGS /////

function updateSettings() {
  document.documentElement.removeAttribute("style");

  // THEME
  if (setting_theme == "theme_light") {
  } else if (setting_theme == "theme_dark") {
    document.documentElement.style.setProperty('--main-color', "#242424");
    document.documentElement.style.setProperty('--main-color-inverted', "white");
    document.documentElement.style.setProperty('--main-background', "#585858");
    document.documentElement.style.setProperty('--transparent--10', "rgba(255, 255, 255, 0.1)");
    document.documentElement.style.setProperty('--transparent--20', "rgba(255, 255, 255, 0.2)");
    document.documentElement.style.setProperty('--transparent--50', "rgba(255, 255, 255, 0.5)");
  } else if (setting_theme == "theme_night") {
    document.documentElement.removeAttribute("style");
    document.documentElement.style.setProperty('--main-color', "black");
    document.documentElement.style.setProperty('--main-color-inverted', "#bebebe");
    document.documentElement.style.setProperty('--main-background', "black");
    document.documentElement.style.setProperty('--transparent--10', "rgba(255, 255, 255, 0.1)");
    document.documentElement.style.setProperty('--transparent--20', "rgba(255, 255, 255, 0.2)");
    document.documentElement.style.setProperty('--transparent--50', "rgba(255, 255, 255, 0.5)");
    document.documentElement.style.setProperty('--transparent--50', "rgba(255, 255, 255, 0.5)");
    document.documentElement.style.setProperty('--light-off', "#696969");
    document.documentElement.style.setProperty('--component-back', "#5e3100");
    document.documentElement.style.setProperty('--component-action', "#600000");
    document.documentElement.style.setProperty('--component-action--hover', "#7c0000");
    document.documentElement.style.setProperty('--toolbar-iconcolor', "#267ba3");
  } else if (setting_theme == "theme_neon") {
    // TODO: NEON THEME
    document.documentElement.style.setProperty('--main-color', "#1b1b1b");
    document.documentElement.style.setProperty('--main-color--second', "#1b1b1b");
    document.documentElement.style.setProperty('--main-color-inverted', "white");
    document.documentElement.style.setProperty('--main-background', "#000000");
    document.documentElement.style.setProperty('--transparent--10', "rgba(255, 255, 255, 0.1)");
    document.documentElement.style.setProperty('--transparent--20', "rgba(255, 255, 255, 0.2)");
    document.documentElement.style.setProperty('--transparent--50', "rgba(255, 255, 255, 0.5)");
    document.documentElement.style.setProperty('--light-off', "rgba(0, 0, 0, 0.6)");
    document.documentElement.style.setProperty('--component-back', "#ff00e7");
    document.documentElement.style.setProperty('--component-action', "#8505fb");
    document.documentElement.style.setProperty('--component-action--hover', "#a13bff");
    document.documentElement.style.setProperty('--light-active', "#ff30ac");
    document.documentElement.style.setProperty('--light-active--shadow', "rgba(224, 18, 141, 0.82)");
    document.documentElement.style.setProperty('--toolbar-iconcolor', "#08f5fb");
  }

  // LINE COLOR
  document.documentElement.style.setProperty('--line-idle', setting_lineColor_idle);
  document.documentElement.style.setProperty('--line-powered', setting_lineColor_powered);

  // BACKGROUND STYLE
  if (setting_background == "dotted") updateMains('background', "radial-gradient(circle, var(--transparent--20) 1px, rgba(0, 0, 0, 0) 1px)");
  else if (setting_background == "lines") updateMains('background', "linear-gradient(to right, var(--transparent--10) 1px, transparent 1px), linear-gradient(to bottom, var(--transparent--10) 1px, transparent 1px)");
  else if (setting_background == "blank") updateMains('background', "none");

  // LINE TYPE
  if (localStorage.lineType !== setting_lineType) {
    localStorage.lineType = setting_lineType;
    updateMains('svg');
  }
}

function updateMains(setting, style) {
  var array = document.querySelectorAll('.main');
  for (var i = 0; i < array.length; i++) {
    if (setting == 'background') array[i].style.backgroundImage = style;
    else if (setting == 'svg') moveSVG(array[i]);
  }
}

var query = document.querySelectorAll(".settings");
for (var i = 0; i < query.length; i++) query[i].addEventListener("click", settingsClick);
function settingsClick() {
  var id = this.classList[0];
  switch (id) {
    case "theme_light":
    case "theme_dark":
    case "theme_night":
    case "theme_neon":
      changeSelect("theme", id);
      setting_theme = id;
      break;
    case "curved":
    case "straight":
    case "lined":
      changeSelect("line_type", id);
      setting_lineType = id;
      break;
    case "dotted":
    case "lines":
    case "blank":
      changeSelect("background", id);
      setting_background = id;
      break;
    default:
      alert(id);
  }
  updateSettings();
}

function changeSelect(id, new_id) {
  document.getElementById(id).getElementsByClassName("active")[0].classList.remove("active");
  document.getElementById(id).getElementsByClassName(new_id)[0].classList.add("active");
}




// var saves = {
//   activeTab: 'main',
//   main: {
//     zoom: 1,
//     top: 0,
//     left: 0,
//     comp_0: {
//       type: 'toggle',
//       x: 5100,
//       y: 5200,
//       label: 'ayy'
//     },
//     comp_1: {
//       type: 'light',
//       x: 5400,
//       y: 5200
//     },
//     conn_0: {
//       from: {elem: 'comp_0'}, // side: 'left', pos: 1
//       to: {elem: 'comp_1'}
//     }
//   }
// };

// var saves = {
//   activeTab: 'main',
//   main: {
//     zoom: 1,
//     top: 0,
//     left: 0,
//     description: '', // <<-- ??????
//     components: {
//       0: {type: 'toggle', x: 5100, y: 5200, label: 'ayy', connections: {1: {}}},
//       1: {type: 'light', x: 5400, y: 5200}
//     }
//   }
// };

// var saves = {
//   activeTab: 'main',
//   tabs: [
//     {
//       name: 'main',
//       description: '', // <<-- ??????
//       zoom: 1,
//       top: 0,
//       left: 0,
//       components: {
//         0: {type: 'toggle', x: 5100, y: 5200, label: 'ayy', connections: {1: {}}},
//         1: {type: 'light', x: 5400, y: 5200}
//       }
//     }
//   ]
// };

var saves = {};
if (localStorage.saves !== "undefined" && localStorage.saves !== undefined) {
  saves = JSON.parse(localStorage.saves);
  // active_tab = saves.activeTab;
}

// TODO: delete elems from saves
var createdElems = {};
if (Object.keys(saves).length > 0) {
  // for (var i = 0; i < Object.keys(saves).length; i++) {
  //   // TODO: create tab if not main
  //   var tab = Object.keys(saves)[i];
  //   // var currentTab = document.getElementById('tab#' + active_tab).querySelector('span').innerHTML;
  //   // if (tab == currentTab) {
  //   if (tab == 'tabs') {
  //   }
  // }
  for (var j = 0; j < saves.tabs.length; j++) {
    var newTab = 'tab#0';
    if (j !== 0) newTab = addTab(saves.tabs[j].name, false).id;
    else document.getElementById(newTab).querySelector('span').innerText = saves.tabs[j].name;
    loadObj(saves.tabs[j], newTab.slice(4, newTab.length));
    document.getElementById(newTab).querySelector('span').classList.remove('unsaved');
  }
  active_tab = saves.activeTab;
  document.getElementById('tab#' + active_tab).click();
}

function loadObj(object, tabId) {
  document.getElementById('tab#' + tabId).click(); // TODO: something better than this

  if (tabId == undefined) tabId = active_tab;
  for (var i = 0; i < Object.keys(object).length; i++) {
    var elem = Object.keys(object)[i];
    var val = object[elem];
    console.log(elem);
    var currentMain = document.getElementById('main#' + tabId);
    console.log(object.top);
    if (elem == 'zoom') currentMain.style[elem] = val;
    else if (elem == 'top' || elem == 'left') currentMain.style[elem] = val + 'px';
    else if (elem == 'components') {
      var conns = {};
      // append elements
      for (var j = 0; j < Object.keys(val).length; j++) {
        var pos = Object.keys(val)[j];
        var cObject = val[pos];
        createdElems[pos] = appendElem(cObject, tabId, true);
        cObject.component = createdElems[pos];
        if (cObject.connection !== undefined) conns[pos] = cObject.connection;
      }
      // add connections
      console.log(conns);
      for (var j = 0; j < Object.keys(createdElems).length; j++) {
        var key = Object.keys(createdElems)[j];
        if (conns[key] !== undefined) {
          var side = conns[key].side || 'left';
          var pos = conns[key].pos || 0;
          var fromSide = conns[key].fromSide || 'right';
          var fromPos = conns[key].fromPos || 0;
          // for (var c = 0; c < Object.keys(conns[key]).length; c++) {
          //   var connKey = Object.keys(conns[key])[c];
          //   var conn = conns[key][connKey];
          //   if (!connKey.toLowerCase().includes('side') && !connKey.toLowerCase().includes('pos')) {
          //     cSVG({elem: createdElems[key], side: conn.fromSide || fromSide, pos: conn.fromPos || fromPos}, {elem: createdElems[connKey], side: conn.side || side, pos: conn.pos || pos});
          //   }
          // }
          for (var c = 0; c < conns[key].connections.length; c++) {
            var conn = conns[key].connections[c];
            console.log('!!!!!!!');
            console.log(createdElems[key]);
            console.log(createdElems[conn.id]);
            console.log(conn);
            // TODO: line created both in main and unnamed_3 ....
            cSVG({elem: createdElems[key], side: conn.fromSide || fromSide, pos: conn.fromPos || fromPos}, {elem: createdElems[conn.id], side: conn.side || side, pos: conn.pos || pos}, tabId);
          }
        }
      }
      // power powered
      var powered = activeMain().querySelectorAll('.powered');
      for (var j = 0; j < powered.length; j++) {
        if (!powered[j].classList.contains('line')) powered[j].children[0].click();
        // powered[j].classList.remove('powered');
      }
      selector('deselect');
    }
    // else if (elem.includes('comp')) {
    //   createdElems[elem] = appendElem(val, tabId, true);
    //   val.component = createdElems[elem];
    // } else if (elem.includes('conn')) {
    //   var fromObj = {elem: createdElems[val.from.elem]};
    //   if (val.from.side) fromObj.side = val.from.side;
    //   if (val.from.pos) fromObj.pos = val.from.pos;
    //   var toObj = {elem: createdElems[val.to.elem]};
    //   if (val.to.side) toObj.side = val.to.side;
    //   if (val.to.pos) toObj.pos = val.to.pos;
    //   cSVG(fromObj, toObj);
    // }
  }
}

function checkSaved(component, tabId) {
  if (tabId == undefined) tabId = active_tab;
  var main = document.getElementById('main#' + tabId);
  var tabObj = tabObject(tabId);
  if (tabObj.components == undefined) tabObj.components = {};
  // TODO: update this upon zoom and move
  tabObj.zoom = main.style.zoom;
  tabObj.left = getNumber(main.style.left);
  tabObj.top = getNumber(main.style.top);

  if (component !== null) {
    var pos = 0;
    for (var i = 0; i < Object.keys(tabObj.components).length; i++) {
      var name = Object.keys(tabObj.components)[i];
      if (component !== undefined) {
        // console.log('CHECK:');
        // console.log(component);
        // console.log('COMPONENT:');
        // console.log(tabObj.components[name].component);
        if (tabObj.components[name].component !== undefined) {
          if (tabObj.components[name].component === component) {
            // console.log('MATCH');
            break;
          }
        }
      }
      pos++;
    }
    if (tabObj.components[pos] == undefined) tabObj.components[pos] = {};
    return {object: tabObj.components[pos], pos: pos};
  }
}

// TODO: select multiple tabs, and export

// update components
function save(e, exportFile) {
  // alert('save!');
  if (e !== undefined) e.preventDefault();
  // save to local storage automatic??
  if (exportFile !== true) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      saveTabByName(tabs[i].id.slice(4, tabs[i].id.length));
    }
  } else saveTabByName(active_tab);

  function saveTabByName(tabId) {
    document.getElementById('tab#' + tabId).querySelector('span').classList.remove('unsaved');
    var main = document.getElementById('main#' + tabId);
    checkSaved(null, tabId);
    var tabObj = tabObject(tabId);
    tabObj.zoom = main.style.zoom;
    tabObj.left = getNumber(main.style.left);
    tabObj.top = getNumber(main.style.top);
    tabObj.name = document.getElementById('tab#' + tabId).querySelector('span').innerText;
    // remove all component elems (only remove in export and not in "saves" var)
    // for (var i = 0; i < Object.keys(tabObj.components).length; i++) {
    //   var cObject = tabObj.components[Object.keys(tabObj.components)[i]];
    //   if (cObject.component !== undefined) delete cObject.component;
    // }
    saves.activeTab = active_tab;
    localStorage.saves = JSON.stringify(saves);
  }

  if (exportFile === true) exportTab();
}
function exportTab() {
  var tabName = document.getElementById('tab#' + active_tab).querySelector('span').innerHTML;
  tabObject().name = tabName;
  exportToJsonFile(JSON.stringify(tabObject(), null, 2));
}

function importFile() {
  var fileInput = document.createElement('input');
  fileInput.setAttribute('type', 'file');
  fileInput.setAttribute('accept', 'json'); // image/png, image/jpeg | logicx
  // fileInput.setAttribute('download', exportFileDefaultName);
  fileInput.click();

  fileInput.addEventListener('change', opened);
}

function opened() {
  // TODO: WIP - import
  var reader = new FileReader();
  reader.onload = onReaderLoad;
  reader.readAsText(event.target.files[0]);

  function onReaderLoad(event) {
    var obj = JSON.parse(event.target.result);
    // create tab
    // TODO: check for already existing
    var tabName = document.getElementById('tab#' + active_tab).querySelector('span').innerHTML;
    saves.tabs.push(obj);
    addTab(obj.name);
    loadObj(obj.name);
    sliderChange();
    updateMap(activeMain(), document.querySelector('.map_overlay'), true);
  }

  // setTimeout(function () {
  //   fileInput.remove();
  // }, 100);
}


function exportToJsonFile(jsonData) {
  var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData);

  var tabName = document.getElementById('tab#' + active_tab).querySelector('span').innerHTML;
  var exportFileDefaultName = tabName + '.json';
  // var exportFileDefaultName = tabName + '.logicx';

  var linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  setTimeout(function () {
    linkElement.remove();
  }, 100);
}
