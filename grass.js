/*
	grass.js
	e53e04ac@gmail.com
	MIT License
*/

'use strict';

var fs = require('fs');

function wApp(m, n) {
	return {
		toString: function () {
			return 'app(' + m + ',' + n + ')';
		},
		evaluate: function (CED) {
			CED.getV(m - 1).apply(CED, CED.getV(n - 1));
		}
	};
}

function wAbs(n, C) {
	return {
		toString: function () {
			return 'abs(' + n + ',' + C + ')';
		},
		evaluate: function (CED) {
			CED.pushC(n == 1 ? C : wC(wAbs(n - 1, C.clone())));
		}
	};
}

function wC(Is) {
	Is = [].concat(Is || []);
	return {
		toString: function () {
			return '[' + Is + ']';
		},
		addI: function (I) {
			Is.push(I);
		},
		pollI: function () {
			return Is.shift();
		},
		clone: function () {
			return wC(Is);
		}
	};
}

function wE(Vs) {
	Vs = [].concat(Vs || []);
	return {
		toString: function () {
			return '[' + Vs + ']';
		},
		pushV: function (V) {
			Vs.unshift(V);
		},
		getV: function (i) {
			return Vs[i];
		},
		clone: function () {
			return wE(Vs);
		}
	};
}

function wD(CEs) {
	CEs = [].concat(CEs || []);
	return {
		toString: function () {
			return '[' + CEs + ']';
		},
		pushCE: function (CE) {
			CEs.unshift(CE);
		},
		popCE: function () {
			return CEs.shift();
		}
	};
}

function wCE(C, E) {
	return {
		toString: function () {
			return '{C:' + C + ',E:' + E + '}';
		},
		apply: function (CED, V) {
			CED.pushCE(this);
			CED.pushV(V);
		},
		getC: function () {
			return C;
		},
		getE: function () {
			return E;
		}
	};
}

function wCED(C, E, D) {
	C = C.clone();
	return {
		toString: function () {
			return '{C:' + C + ',E:' + E + ',D:' + D + '}';
		},
		pushCE: function (CE) {
	        D.pushCE(wCE(C, E));
	        C = CE.getC().clone();
	        E = CE.getE().clone();
		},
		popCE: function () {
			var CE = D.popCE();
			if (CE == null) {
				return false;
			}
			C = CE.getC();
			var V = this.getV(0);
			E = CE.getE();
			this.pushV(V);
			return true;
		},
		getV: function (i) {
			return E.getV(i);
		},
		pushV: function (V) {
			E.pushV(V);
		},
		pushC: function (C) {
			E.pushV(wCE(C, E.clone()));
		},
		popI: function () {
			return C.pollI();
		}
	};
}

function wTRUE() {
	return wCE(wC(wAbs(1, wC(wApp(2, 3)))), wE(wCE(wC(), wE())));
}

function wFALSE() {
	return wCE(wC(wAbs(1, wC())), wE());
}

function ww(n) {
	return {
		toString: function () {
			return '"' + String.fromCharCode(n) + '"';
		},
		apply: function (CED, V) {
			CED.pushV(V instanceof ww && V.getN() == n ? wTRUE() : wFALSE());
		},
		getN: function () {
			return n;
		}
	};
}

function wOut(write) {
	return {
		toString: function () {
			return 'Out';
		},
		apply: function (CED, V) {
			write(V.getN());
			CED.pushV(V);
		}
	};
}

function wIn(read) {
	return {
		toString: function () {
			return 'In';
		},
		apply: function (CED, V) {
			var n = read();
			CED.pushV(n == -1 ? V : ww(n));
		}
	};
}

function wSucc() {
	return {
		toString: function () {
			return 'Succ';
		},
		apply: function (CED, V) {
			CED.pushV(ww((V.getN() + 1) & 0xFF));
		}
	};
}

function loadProgram(filename) {
	var inputList = fs.readFileSync(filename, 'utf8');
	inputList = inputList.replace(/Ｗ/g, 'W');
	inputList = inputList.replace(/ｖ/g, 'v');
	inputList = inputList.replace(/ｗ/g, 'w');
	inputList = inputList.replace(/[^Wvw]/g, '');
	inputList = inputList.replace(/^[^w]+/g, '');
	inputList = inputList.split(/(W+|v+|w+)/);
	inputList = inputList.filter(function (x) { return x != ''; });
	inputList = inputList.map(function (x) { return { character: x[0], length: x.length }; });
	inputList.push({ character: '.', length: 0 });
	var program = wC();
	var state = 0;
	var abs_n = null;
	var abs_C = null;
	var app_m = null;
	var app_n = null;
	for (var i = 0, n = inputList.length; i < n; i++) {
		var input = inputList[i];
		switch (state) {
			case 0: switch (input.character) {
				case '.':
					throw new Error();
				case 'W':
					throw new Error();
				case 'v':
					throw new Error();
				case 'w':
					abs_n = input.length;
					abs_C = wC();
					state = 1;
					continue;
			}
			case 1: switch (input.character) {
				case '.':
					state = 7;
					continue;
				case 'W':
					app_m = input.length;
					state = 2;
					continue;
				case 'v':
					program.addI(wAbs(abs_n, abs_C));
					abs_n = null;
					abs_C = null;
					state = 4;
					continue;
				case 'w':
					throw new Error();
			}
			case 2: switch (input.character) {
				case '.':
					throw new Error();
				case 'W':
					throw new Error();
				case 'v':
					throw new Error();
				case 'w':
					app_n = input.length;
					abs_C.addI(wApp(app_m, app_n));
					app_m = null;
					app_n = null;
					state = 3;
					continue;
			}
			case 3: switch (input.character) {
				case '.':
					program.addI(wAbs(abs_n, abs_C));
					abs_n = null;
					abs_C = null;
					state = 7;
					continue;
				case 'W':
					app_m = input.length;
					state = 2;
					continue;
				case 'v':
					program.addI(wAbs(abs_n, abs_C));
					abs_n = null;
					abs_C = null;
					state = 4;
					continue;
				case 'w':
					throw new Error();
			}
			case 4: switch (input.character) {
				case '.':
					throw new Error();
				case 'W':
					app_m = input.length;
					state = 5;
					continue;
				case 'v':
					throw new Error();
				case 'w':
					abs_n = input.length;
					abs_C = wC();
					state = 1;
					continue;
			}
			case 5: switch (input.character) {
				case '.':
					throw new Error();
				case 'W':
					throw new Error();
				case 'v':
					throw new Error();
				case 'w':
					app_n = input.length;
					program.addI(wApp(app_m, app_n));
					app_m = null;
					app_n = null;
					state = 6;
					continue;
			}
			case 6: switch (input.character) {
				case '.':
					state = 7;
					continue;
				case 'W':
					app_m = input.length;
					state = 5;
					continue;
				case 'v':
					state = 4;
					continue;
				case 'w':
					abs_n = input.length;
					abs_C = wC();
					state = 1;
					continue;
			}
			case 7: switch (input.character) {
				case '.':
					state = 7;
					continue;
				case 'W':
					throw new Error();
				case 'v':
					throw new Error();
				case 'w':
					throw new Error();
			}
		}
	}
	return program;
}

function executeProgram(program) {
	var C0 = program;
	var E0 = wE([
		wOut(function (n) { process.stdout.write(Buffer.from([n])); }),
		wSucc(),
		ww('w'.charCodeAt(0)),
		wIn(function () { return process.stdin.read(1); })
	]);
	var D0 = wD(wCE(wC(wApp(1, 1)), wE()));
	var CED = wCED(C0, E0, D0);
	while (true) {
		var I = CED.popI();
		if (I != null) {
			I.evaluate(CED);
		} else if (!CED.popCE()) {
			break;
		}
	}
}

function main() {
	var filename = process.argv[2];
	if (filename == null) {
		console.log('Usage: node grass filename');
		process.exit();
	}
	var program = loadProgram(filename);
	executeProgram(program);
}

main();
