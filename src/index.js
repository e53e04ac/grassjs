/*!
 * grassjs/src/index.js
 * e53e04ac <e53e04ac@gmail.com>
 * MIT License
 */

const { Grass } = (() => {

    /** @typedef Grass @type {import('..').Grass.Grass} */

    const stream = require('stream');

    /** @type {Grass} */
    const Grass = ({
        App(m, n) {
            return ({
                toString() {
                    return `App(${m},${n})`;
                },
                async evaluate(MC) {
                    await MC.getV(m - 1).apply(MC, MC.getV(n - 1));
                },
            });
        },
        Abs(n, C) {
            return ({
                toString() {
                    return `Abs(${n},${C})`;
                },
                async evaluate(MC) {
                    MC.pushC(n == 1 ? C : Grass.C(Grass.Abs(n - 1, C.clone())));
                },
            });
        },
        C(I) {
            const array = (I instanceof Array ? [...I] : (I != null ? [I] : []));
            return ({
                toString() {
                    return `[${array}]`;
                },
                push(I) {
                    array.push(I);
                },
                pop() {
                    return array.shift();
                },
                clone() {
                    return Grass.C(array);
                },
            });
        },
        E(f) {
            const array = (f instanceof Array ? [...f] : (f != null ? [f] : []));
            return ({
                toString() {
                    return `[${array}]`;
                },
                push(f) {
                    array.unshift(f);
                },
                get(i) {
                    return array[i];
                },
                clone() {
                    return Grass.E(array);
                },
            });
        },
        D(f) {
            const array = (f instanceof Array ? [...f] : (f != null ? [f] : []));
            return ({
                toString() {
                    return `[${array}]`;
                },
                push(f) {
                    array.unshift(f);
                },
                pop() {
                    return array.shift();
                },
            });
        },
        f(C, E) {
            return ({
                toString() {
                    return `{C:${C},E:${E}}`;
                },
                async apply(MC, f) {
                    MC.pushCE(this);
                    MC.pushV(f);
                },
                C() {
                    return C;
                },
                E() {
                    return E;
                },
                n() {
                    throw new Error();
                },
            });
        },
        MC(C, E, D) {
            C = C.clone();
            return ({
                toString() {
                    return `{C:${C},E:${E},D:${D}}`;
                },
                pushCE(CE) {
                    D.push(Grass.f(C, E));
                    C = CE.C().clone();
                    E = CE.E().clone();
                },
                popCE() {
                    const CE = D.pop();
                    if (CE == null) {
                        return false;
                    } else {
                        C = CE.C();
                        const f = E.get(0);
                        E = CE.E();
                        E.push(f);
                        return true;
                    }
                },
                getV(i) {
                    return E.get(i);
                },
                pushV(f) {
                    E.push(f);
                },
                pushC(C) {
                    E.push(Grass.f(C, E.clone()));
                },
                popI() {
                    return C.pop();
                },
            });
        },
        TRUE() {
            return (
                Grass.f(
                    Grass.C(
                        Grass.Abs(
                            1,
                            Grass.C(
                                Grass.App(
                                    2,
                                    3
                                )
                            )
                        )
                    ),
                    Grass.E(
                        Grass.f(
                            Grass.C(),
                            Grass.E()
                        )
                    )
                )
            );
        },
        FALSE() {
            return (
                Grass.f(
                    Grass.C(
                        Grass.Abs(
                            1,
                            Grass.C()
                        )
                    ),
                    Grass.E()
                )
            );
        },
        w(n) {
            return ({
                toString() {
                    return `"${String.fromCharCode(n)}"`;
                },
                async apply(MC, f) {
                    MC.pushV(f.n() == n ? Grass.TRUE() : Grass.FALSE());
                },
                C() {
                    throw new Error();
                },
                E() {
                    throw new Error();
                },
                n() {
                    return n;
                },
            });
        },
        Out(write) {
            return ({
                toString() {
                    return 'Out';
                },
                async apply(MC, f) {
                    await write(f.n());
                    MC.pushV(f);
                },
                C() {
                    throw new Error();
                },
                E() {
                    throw new Error();
                },
                n() {
                    throw new Error();
                },
            });
        },
        In(read) {
            return ({
                toString() {
                    return 'In';
                },
                async apply(MC, f) {
                    const n = await read();
                    MC.pushV(n == -1 ? f : Grass.w(n));
                },
                C() {
                    throw new Error();
                },
                E() {
                    throw new Error();
                },
                n() {
                    throw new Error();
                },
            });
        },
        Succ() {
            return ({
                toString() {
                    return 'Succ';
                },
                async apply(MC, f) {
                    MC.pushV(Grass.w((f.n() + 1) & 0xFF));
                },
                C() {
                    throw new Error();
                },
                E() {
                    throw new Error();
                },
                n() {
                    throw new Error();
                },
            });
        },
        parse(string) {

            /** @type {import('..').Grass.ParserStateContext} */
            const context = ({
                code: Grass.C(),
                state: 0,
                abs_n: null,
                abs_C: null,
                app_m: null,
                reject(message) {
                    throw new Error(message);
                },
                next(context) {
                    return {
                        ...this,
                        ...context,
                    };
                },
                absBegin(abs_n) {
                    return this.next({
                        abs_n,
                        abs_C: Grass.C(),
                    });
                },
                absEnd() {
                    if (this.abs_n == null || this.abs_C == null) {
                        return this.reject();
                    }
                    this.code.push(Grass.Abs(this.abs_n, this.abs_C));
                    return this.next({
                        abs_n: null,
                        abs_C: null,
                    });
                },
                appBegin(app_m) {
                    return this.next({
                        app_m,
                    });
                },
                appEnd(app_n) {
                    if (this.app_m == null) {
                        return this.reject();
                    }
                    this.code.push(Grass.App(this.app_m, app_n));
                    return this.next({
                        app_m: null,
                    });
                },
                absAppEnd(app_n) {
                    if (this.abs_C == null || this.app_m == null) {
                        return this.reject();
                    }
                    this.abs_C.push(Grass.App(this.app_m, app_n));
                    return this.next({
                        app_m: null,
                    });
                },
            });

            /** @type {import('..').Grass.ParserStateTransitionTable} */
            const table = ({
                0: {
                    '.': (y, x) => y.reject(),
                    'W': (y, x) => y.reject(),
                    'v': (y, x) => y.reject(),
                    'w': (y, x) => y.absBegin(x).next({ state: 1 }),
                },
                1: {
                    '.': (y, x) => y.next({ state: 7 }),
                    'W': (y, x) => y.appBegin(x).next({ state: 2 }),
                    'v': (y, x) => y.absEnd().next({ state: 4 }),
                    'w': (y, x) => y.reject(),
                },
                2: {
                    '.': (y, x) => y.reject(),
                    'W': (y, x) => y.reject(),
                    'v': (y, x) => y.reject(),
                    'w': (y, x) => y.absAppEnd(x).next({ state: 3 }),
                },
                3: {
                    '.': (y, x) => y.absEnd().next({ state: 7 }),
                    'W': (y, x) => y.appBegin(x).next({ state: 2 }),
                    'v': (y, x) => y.absEnd().next({ state: 4 }),
                    'w': (y, x) => y.reject(),
                },
                4: {
                    '.': (y, x) => y.reject(),
                    'W': (y, x) => y.appBegin(x).next({ state: 5 }),
                    'v': (y, x) => y.reject(),
                    'w': (y, x) => y.absBegin(x).next({ state: 1 }),
                },
                5: {
                    '.': (y, x) => y.reject(),
                    'W': (y, x) => y.reject(),
                    'v': (y, x) => y.reject(),
                    'w': (y, x) => y.appEnd(x).next({ state: 6 }),
                },
                6: {
                    '.': (y, x) => y.next({ state: 7 }),
                    'W': (y, x) => y.appBegin(x).next({ state: 5 }),
                    'v': (y, x) => y.next({ state: 4 }),
                    'w': (y, x) => y.absBegin(x).next({ state: 1 }),
                },
                7: {
                    '.': (y, x) => y.next({ state: 7 }),
                    'W': (y, x) => y.reject(),
                    'v': (y, x) => y.reject(),
                    'w': (y, x) => y.reject(),
                },
            });

            return string
                .replace(/Ｗ/g, 'W')
                .replace(/ｖ/g, 'v')
                .replace(/ｗ/g, 'w')
                .replace(/[^Wvw]/g, '')
                .replace(/^[^w]+/g, '')
                .split(/(W+|v+|w+)/)
                .filter((x) => {
                    return x != '';
                })
                .map((x) => {
                    return { character: x[0], length: x.length };
                })
                .concat({ character: '.', length: 0 })
                .reduce((context, input) => {
                    if (input.character != '.' && input.character != 'W' && input.character != 'v' && input.character != 'w') {
                        throw new Error();
                    }
                    return table[context.state][input.character](context, input.length);
                }, context)
                .code;

        },
        async run(code) {
            const C0 = code;
            const E0 = Grass.E([
                Grass.Out(async (n) => {
                    await new Promise((resolve, reject) => {
                        const readable = new stream.Readable({
                            highWaterMark: 1,
                            read(size) {
                                this.push(Buffer.from([n]));
                                this.push(null);
                            },
                        });
                        readable.on('close', () => {
                            resolve(undefined);
                        });
                        readable.pipe(process.stdout, {
                            end: false
                        });
                    });
                }),
                Grass.Succ(),
                Grass.w('w'.charCodeAt(0)),
                Grass.In(async () => {
                    return await new Promise((resolve, reject) => {
                        const writable = new stream.Writable({
                            highWaterMark: 1,
                            write(chunk, encoding, callback) {
                                process.stdin.unpipe(writable);
                                const n = chunk[0];
                                process.stdin.unshift(chunk.slice(1));
                                callback();
                                resolve(n);
                            },
                        });
                        process.stdin.pipe(writable, {
                            end: false
                        });
                    });
                })
            ]);
            const D0 = Grass.D(
                Grass.f(
                    Grass.C(
                        Grass.App(
                            1,
                            1
                        )
                    ),
                    Grass.E()
                )
            );
            const MC = Grass.MC(C0, E0, D0);
            while (true) {
                const I = MC.popI();
                if (I == null) {
                    if (MC.popCE()) {
                        continue;
                    } else {
                        break;
                    }
                }
                await I.evaluate(MC);
            }
        },
    });

    return { Grass };

})();

module.exports = { Grass };
