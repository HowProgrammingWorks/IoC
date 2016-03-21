// Файл, демонстрирующий то, как фреймворк создает среду (песочницу) для
// исполнения приложения, загружает приложение, передает ему песочницу в
// качестве глобального контекста и получает ссылу на экспортируемый
// приложением интерфейс. Читайте README.md в нем задания.

// Фреймворк может явно зависеть от библиотек через dependency lookup
var fs   = require('fs'),
    vm   = require('vm'),
	util = require('util');

// Чоздаем контекст-песочницу, которая станет глобальным контекстом приложения
var context = {
    module      : {},
    console     : console,
    setTimeout  : setTimeout,
    setInterval : setInterval,
    util        : util,
    console: {
        log: (message) => {
            const date = new Date();
            const text = `${fileName} ${date.toUTCString()} ${message}`;
            console.log(text);
            writeToFile(text);
        }
    },
    require: (module) => {
            const date = new Date();
            const text = `${date.toUTCString()} ${module}\n`;
            writeToFile(text);
            return require(module);
          }
};

 //console.log(process.argv[2]);

const logfile = 'awesome.log';

    function writeToFile(message) {
          fs.appendFile(logfile, `${message}\n`, (err) => {
                if (err) {
                      return console.log(err);
                    }
              });
        }

function createFile() {
      fs.writeFile(logfile, '', (err) => {
            if (err) {
                  return console.log(err);
                }
          });
    }


context.global = context;
var sandbox = vm.createContext(context);

function printFunctionParams(func) {
    const myFunc = func.toString();
    const arr = myFunc.split('(')[1].split(')')[0].split(',');
    console.log('Params:');
    arr.forEach((item) => {
        item = item.trim();
        console.log(`- ${item}`);
    });
    console.log(`Amount: ${arr.length}`);
}

function deepClone(targetObject, resultObject) {
    Object.keys(targetObject).forEach((item) => {
        if (typeof targetObject[item] === 'object') {
            if (item === 'global') {
                resultObject[item] = resultObject;
            } else {
                resultObject[item] = {};
                deepClone(targetObject[item], resultObject[item]);
            }
        } else {
            resultObject[item] = targetObject[item];
        }
    });
}

let oldSandbox = {};
deepClone(sandbox, oldSandbox);

function diff(object1, object2) {
    let arr1 = new Array();
    let arr2 = new Array();

    function objectToArray(obj, arr) {
        Object.keys(obj).forEach((item) => {
            if (typeof obj[item] === 'object' && item !== 'global') {
                objectToArray(obj[item], arr);
            } else {
                arr.push(item);
            }
        });
    }

    objectToArray(object1, arr1);
    objectToArray(object2, arr2);

    arr1.forEach((item) => {
        if (arr2.indexOf(item) === -1) {
            console.log(`Added: ${item}`);
        }
    });
    arr2.forEach((item) => {
        if (arr1.indexOf(item) === -1) {
            console.log(`Removed: ${item}`);
        }
    });
}

for (var i in process.argv)
{
    if(i>1){
        var fileN = './' + process.argv[i] + '.js';
        fs.readFile(fileN, function(err, src){
            createFile();

            var script = vm.createScript(src, fileN);
            script.runInNewContext(sandbox);

            diff(sandbox, oldSandbox);
        });
    }
}
// Читаем исходный код приложения из файла
//var fileName = './application2.js';
//fs.readFile(fileName, function(err, src) {
  // Тут нужно обработать ошибки
  
  // Запускаем код приложения в песочнице
  
  
  // Забираем ссылку из sandbox.module.exports, можем ее исполнить,
  // сохранить в кеш, вывести на экран исходный код приложения и т.д.
//});