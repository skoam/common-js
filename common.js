function Size(width, height) {
  this.width = width;
  this.height = height;
}

function Location(x, y) {
  this.x = x;
  this.y = y;
}

function Update(interval, name) {
  this.updateFunction = interval;
  this.name = name;

  this.stop = function stop () {
    clearInterval(this.updateFunction);
  };
}

function ObjectWrapper() {
  this.content = [];
}

function log(val, name, debugfunction) {
  var functionName = arguments.callee.caller ? arguments.callee.caller.name : null;

  if (functionName === null || functionName === "") {
    functionName = "Anonymous Function";
  }

  if (name !== null) {
    console.log("######## " + name + " (" + functionName + ") #############");
  }

  console.log(val);

  if (debugfunction) {
    var caller = new ObjectWrapper();
    caller.content.push(arguments.callee.caller);
    console.log(caller);
  }
}

var ProcessManager = function ProcessManager () {
  var me = this;

  this.processes = [];

  this.addProcess = function addProcess (process) {
    this.processes.push(process);
  };

  this.removeProcess = function removeProcess (process) {
    for (var i = 0; i < me.processes.length; i++) {
      if (me.processes[i] == process) {
        clearInterval(me.processes[i].checkInterval);
        me.processes.splice(i, 1);
      }
    }
  };

  this.removeProcessByName = function removeProcessByName (name) {
    for (var i = 0; i < me.processes.length; i++) {
      if (me.processes[i].name == name) {
        clearInterval(me.processes[i].checkInterval);
        me.processes.splice(i, 1);
        i--;
      }
    }
  };

  this.killAllProcesses = function killAllProcesses () {
    for (var i = 0; i < me.processes.length; i++) {
      clearInterval(me.processes[i].checkInterval);
    }

    me.processes = [];
  };
};

processManager = new ProcessManager();

var AsyncInvoker = function AsyncInvoker(func, obj, condition, value, alternateFunc, interval, name) {
  var me = this;
  this.func = func;
  this.alternateFunc = alternateFunc;
  this.checkInterval = {};
  this.interval = interval ? interval : 200;
  this.condition = obj + " " + condition + " " + value;
  this.name = name;

  this.start = function start () {
    me.checkInterval = setInterval(function () {
      if (condition == "is") {
        if (eval(obj) == value) {
          // log(me.func, "finished async function");
          processManager.removeProcess(me);
          me.func();
        }
      } else if (condition == "not") {
        if (eval(obj) != value) {
          // log(me.func, "finished async function");
          processManager.removeProcess(me);
          me.func();
        }
      }

      if (alternateFunc) {
        me.alternateFunc();
      }
    }, me.interval);
  };
};

var AsyncRepeater = function AsyncRepeater (func, obj, condition, value,
                                            alternateFunc, interval, name,
                                            number_of_executions, timeoutFunc) {
  var me = this;
  this.func = func;
  this.alternateFunc = alternateFunc;
  this.checkInterval = {};
  this.interval = interval ? interval : 200;
  this.condition = obj + " " + condition + " " + value;
  this.name = name;
  this.number_of_executions = number_of_executions;
  this.times = 0;
  this.timeoutFunc = timeoutFunc;

  this.start = function start () {
    me.checkInterval = setInterval(function () {
      if (condition == "is") {
        if (eval(obj) == value) {
          // log(me.func, "finished async function");
          me.func();
        }
      } else if (condition == "not") {
        if (eval(obj) != value) {
          // log(me.func, "finished async function");
          me.func();
        }
      }

      if (alternateFunc) {
        me.alternateFunc();
      }

      if (me.number_of_executions !== null) {
        me.times++;
        if (me.times >= me.number_of_executions) {
          processManager.removeProcess(me);
          if (me.timeoutFunc) {
            me.timeoutFunc();
          }
        }
      }
    }, me.interval);
  };
};

function relativeFunction (func, obj, condition, value, alternateFunc, interval, name) {
  var asyncCheck = new AsyncInvoker(func, obj, condition, value, alternateFunc, interval, name);
  asyncCheck.start();
  processManager.addProcess(asyncCheck);
}

function relativeRepeaterFunction (func, obj, condition, value, alternateFunc,
                                   interval, name, number_of_executions, timeoutFunc) {
  var asyncCheck = new AsyncRepeater(
    func, obj, condition, value, alternateFunc,
    interval, name, number_of_executions, timeoutFunc);
  asyncCheck.start();
  processManager.addProcess(asyncCheck);
  return asyncCheck;
}

function headline(string, type) {
  if (type === null) {
    return "<h1>" + string + "</h1>";
  } else {
    return "<h" + type + ">" + string + "</h" + type + ">";
  }
}

function list(container, sub, type) {
  var output;

  if (type === null || type == "array") {
    var i = 0;
    if (sub === null) {
      for (i = 0; i < container.length; i++) {
        output += "<div>" + container[i] + "</div>";
      }
    } else {
      for (i = 0; i < container.length; i++) {
        output += "<div>" + container[i][sub] + "</div>";
      }
    }
  }

  if (type == "object") {
    for (var key in container) {
      if (!container.hasOwnProperty(key)) continue;
      if (container[key] !== null) {
        output += "<div>" + container[key].textContent + "</div>";
      }
    }
  }

  return output;
}

function textField(string, cssClass) {
  var output = document.createElement("textarea");

  output.innerHTML = string;
  output.className = cssClass;

  return output;
}

function stringifyObject(container) {
  var output = "";
  for (var key in container) {
    if (!container.hasOwnProperty(key)) continue;
    if (container[key] !== null) {
      output += container[key].textContent;
    }
  }
}

function randomID () {
  return Math.random().toString().replace(".", "").slice(0, 8);
}

function cloakLink (link) {
  if (link.indexOf("?") == -1) {
    link += "?" + new Date().getTime();
  } else {
    var end = link.indexOf("?");
    link = link.slice(0, end);
  }

  return link;
}

var Cookie = function cookie (cookieName, value, expirationTime) {
  var me = this;

  this.name = cookieName;
  this.value = value;
  this.expirationTime = expirationTime;
  this.separator = "| |";
  this.equals = ":is:";

  this.write = function write () {
    document.cookie = this.name + "=" + this.value + ';expires='+this.expirationTime+';path=/';
  };

  this.read = function read () {
    if (document.cookie.indexOf(this.name) != -1) {
      var cookie = document.cookie.slice(document.cookie.indexOf(this.name) + this.name.length + 1, document.cookie.length);
      if (cookie === "" || cookie === null) {
        return false;
      } else if (cookie.indexOf(";") == -1) {
        if (cookie === "") {
          return false;
        }
        return cookie;
      } else {
        var slicedCookie = cookie.slice(0, cookie.indexOf(";"));
        if (slicedCookie === "") {
          return false;
        }
        return slicedCookie;
      }
    } else {
      return false;
    }
  };

  this.remove = function remove () {
    document.cookie = this.name + '=;expires=;path=/';
  };
};

var CookieHandler = function CookieHandler () {
  var me = this;
  this.cookies = [];
  this.expirationTime = null;

  this.cookie = function cookie (name) {
    for (var i = 0; i < me.cookies.length; i++) {
      if (me.cookies[i].name == name) {
        return me.cookies[i];
      }
    }

    return false;
  };

  this.addCookie = function addCookie (name, value, expirationTime) {
    if (!expirationTime) {
      expirationTime = me.expirationTime;
    }

    if (!me.cookie(name)) {
      var cookie = new Cookie(name, value, expirationTime);
      me.cookies.push(cookie);
      return cookie;
    } else {
      me.cookie(name).name = name;
      me.cookie(name).value = value;
      me.cookie(name).expirationTime = expirationTime;
      return me.cookie(name);
    }
  };

  this.readMultipleValueCookie = function (cookieName) {
    if (me.cookie(cookieName).read()) {
      var cookie = me.cookie(cookieName);
      var content = cookie.read().split(cookie.separator);
      var output = {};

      for (var i = 0; i < content.length; i++) {
        if (content[i] !== null && content[i] !== "") {
          var pair = content[i].split(cookie.equals);
          output[pair[0]] = pair[1];
        }
      }

      return output;
    }

    return false;
  };
  
  this.writeMultipleValueCookie = function (cookieName, object) {
    var cookie = me.cookie(cookieName);

    var input = "";
    for (var key in object) {
      if (!object.hasOwnProperty(key)) continue;
      if (object[key] !== null) {
        input += key + cookie.equals + object[key] + cookie.separator;
      }
    }

    cookie.value = input;
    cookie.write();
  };
  
  this.deleteAllCookies = function () {
    for (var i = 0; i < me.cookies.length; i++) {
      me.cookies[i].remove();
    }
  };
};

/* thx to Ronald Fisher and Frank Yates */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * Convert an image
 * to a base64 string
 * @param  {String}   url
 * @param  {Function} callback
 * @param  {String}   [outputFormat=image/png]
 */
function convertImgToBase64(url, callback, outputFormat){
  var canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
  img.crossOrigin = 'Anonymous';
  img.onload = function(){
    var dataURL;
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback.call(this, dataURL);
    canvas = null;
  };
  img.src = url;
}

function getNodeById (nodes, id) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i]["attributes"].id.value == id) {
      return nodes[i];
    }
  }

  return false;
}

function saneDocumentURL () {
  var url = document.URL;

  if (document.URL.indexOf("?") != -1) {
    url = url.slice(0, document.URL.indexOf("?"));
  }

  if (url[url.length - 1] == '/') {
    url = url.slice(0, url.length - 1);
  }

  return url;
}

function contains(a, obj) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

function positionInArray(a, obj) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] === obj) {
      return i;
    }
  }
  return false;
}

/*
 * deep extend objects
 */
Object.extend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor && source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

function addClass (className, elementID) {
  document.getElementById(elementID).className += " " + className;
}

function removeClass (className, elementID) {
  var elementClass = document.getElementById(elementID).className;
  elementClass = elementClass.replace(" " + className, "");
  elementClass = elementClass.replace(className, "");
  document.getElementById(elementID).className = elementClass;
}

var DateAndTime = function () {
  var me = this;

  this.inAMonth = function () {
    var date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  };

  this.inAYear = function () {
    var date = new Date();
    date.setYear(date.getFullYear() + 1);
    return date;
  };

  this.today = function () {
    return new Date();
  };
};

var dateAndTime = new DateAndTime();
