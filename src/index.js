/*!
 * grassjs/src/index.js
 * e53e04ac <e53e04ac@gmail.com>
 * MIT License
 */

/** @typedef Grass @type {import('../types').Grass} */

const stream = require('stream');

/** @type {Grass} */
const Grass = {
    App(m, n) {
        return ({
            toString() {
                return `App(${m},${n})`;
            },
            async evaluate(MC) {
                await MC.getV(m - 1).apply(MC, MC.getV(n - 1));
            }
        });
    },
    Abs(n, C) {
        return ({
            toString() {
                return `Abs(${n},${C})`;
            },
            async evaluate(MC) {
                MC.pushC(n == 1 ? C : Grass.C(Grass.Abs(n - 1, C.clone())));
            }
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
            }
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
            }
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
            }
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
            }
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
            }
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
        return {
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
            }
        };
    },
    Out(write) {
        return {
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
            }
        };
    },
    In(read) {
        return {
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
            }
        };
    },
    Succ() {
        return {
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
            }
        };
    },
    parse(string) {

        /** @typedef Code @type {import('../types').Code} */
        /** @typedef Input @type {{ character: string; length: number; }}  */
        /** @typedef State @type {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7} */
        /** @typedef Context @type {{ code: Code; state: State; abs_n: number; abs_C: Code; app_m: number; app_n: number; }}  */
        /** @typedef Table @type {Record<number, Record<string, { (context: any, input: Input): any; }>>} */

        /** @type {Table} */
        const table = {};
        table[0] = {};
        table[0]['.'] = (context, input) => { throw new Error(); };
        table[0]['W'] = (context, input) => { throw new Error(); };
        table[0]['v'] = (context, input) => { throw new Error(); };
        table[0]['w'] = (context, input) => { return ({ ...context, state: 1, abs_n: input.length, abs_C: Grass.C() }); };
        table[1] = {};
        table[1]['.'] = (context, input) => { return ({ ...context, state: 7 }); };
        table[1]['W'] = (context, input) => { return ({ ...context, state: 2, app_m: input.length }); };
        table[1]['v'] = (context, input) => { context.code.push(Grass.Abs(context.abs_n, context.abs_C)); return ({ ...context, state: 4, abs_n: null, abs_C: null }); };
        table[1]['w'] = (context, input) => { throw new Error(); };
        table[2] = {};
        table[2]['.'] = (context, input) => { throw new Error(); };
        table[2]['W'] = (context, input) => { throw new Error(); };
        table[2]['v'] = (context, input) => { throw new Error(); };
        table[2]['w'] = (context, input) => { context.abs_C.push(Grass.App(context.app_m, input.length)); return ({ ...context, state: 3, app_m: null, app_n: null }); };
        table[3] = {};
        table[3]['.'] = (context, input) => { context.code.push(Grass.Abs(context.abs_n, context.abs_C)); return ({ ...context, state: 7, abs_n: null, abs_C: null }); };
        table[3]['W'] = (context, input) => { return ({ ...context, state: 2, app_m: input.length }); };
        table[3]['v'] = (context, input) => { context.code.push(Grass.Abs(context.abs_n, context.abs_C)); return ({ ...context, state: 4, abs_n: null, abs_C: null }); };
        table[3]['w'] = (context, input) => { throw new Error(); };
        table[4] = {};
        table[4]['.'] = (context, input) => { throw new Error(); };
        table[4]['W'] = (context, input) => { return ({ ...context, state: 5, app_m: input.length }); };
        table[4]['v'] = (context, input) => { throw new Error(); };
        table[4]['w'] = (context, input) => { return ({ ...context, state: 1, abs_n: input.length, abs_C: Grass.C() }); };
        table[5] = {};
        table[5]['.'] = (context, input) => { throw new Error(); };
        table[5]['W'] = (context, input) => { throw new Error(); };
        table[5]['v'] = (context, input) => { throw new Error(); };
        table[5]['w'] = (context, input) => { context.code.push(Grass.App(context.app_m, input.length)); return ({ ...context, state: 6, app_m: null, app_n: null }); };
        table[6] = {};
        table[6]['.'] = (context, input) => { return ({ ...context, state: 7 }); };
        table[6]['W'] = (context, input) => { return ({ ...context, state: 5, app_m: input.length }); };
        table[6]['v'] = (context, input) => { return ({ ...context, state: 4 }); };
        table[6]['w'] = (context, input) => { return ({ ...context, state: 1, abs_n: input.length, abs_C: Grass.C() }); };
        table[7] = {};
        table[7]['.'] = (context, input) => { return ({ ...context, state: 7 }); };
        table[7]['W'] = (context, input) => { throw new Error(); };
        table[7]['v'] = (context, input) => { throw new Error(); };
        table[7]['w'] = (context, input) => { throw new Error(); };

        /** @type {Context} */
        const context = { code: Grass.C(), state: 0, abs_n: null, abs_C: null, app_m: null, app_n: null };

        return string
            .replace(/Ｗ/g, 'W')
            .replace(/ｖ/g, 'v')
            .replace(/ｗ/g, 'w')
            .replace(/[^Wvw]/g, '')
            .replace(/^[^w]+/g, '')
            .split(/(W+|v+|w+)/)
            .filter((x) => { return x != ''; })
            .map((x) => { return { character: x[0], length: x.length }; })
            .concat({ character: '.', length: 0 })
            .reduce((context, input) => table[context.state][input.character](context, input), context)
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
                        }
                    });
                    readable.on('close', () => {
                        resolve();
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
                        }
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
    }
};

module.exports = { Grass };
