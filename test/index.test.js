/*!
 * grassjs/test/index.test.js
 * e53e04ac <e53e04ac@gmail.com>
 * MIT License
 */

'use strict';

const fs = require('fs');

const chai = require('chai');

describe('index.js', async () => {

    const { Grass } = require('../');

    it('coverage', async () => {

        Grass.App(0, 0).toString();
        Grass.App(0, 0).evaluate(Grass.MC(Grass.C(), Grass.E(), Grass.D()));

        Grass.Abs(0, Grass.C()).toString();
        Grass.Abs(0, Grass.C()).evaluate(Grass.MC(Grass.C(), Grass.E(), Grass.D()));
        Grass.Abs(1, Grass.C()).evaluate(Grass.MC(Grass.C(), Grass.E(), Grass.D()));

        Grass.C().toString();
        Grass.C().push(Grass.App(0, 0));
        Grass.C().pop();
        Grass.C().clone();

        Grass.E().toString();
        Grass.E().push(Grass.f(Grass.C(), Grass.E()));
        Grass.E().get(0);
        Grass.E().clone();

        Grass.D().toString();
        Grass.D().push(Grass.f(Grass.C(), Grass.E()));
        Grass.D().pop();

        Grass.f(Grass.C(), Grass.E()).toString();
        await Grass.f(Grass.C(), Grass.E()).apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.f(Grass.C(), Grass.E()));
        Grass.f(Grass.C(), Grass.E()).C();
        Grass.f(Grass.C(), Grass.E()).E();
        try { Grass.f(Grass.C(), Grass.E()).n() } catch (error) { };

        Grass.MC(Grass.C(), Grass.E(), Grass.D()).toString();
        Grass.MC(Grass.C(), Grass.E(), Grass.D()).pushCE(Grass.f(Grass.C(), Grass.E()));
        Grass.MC(Grass.C(), Grass.E(), Grass.D()).getV(0);
        Grass.MC(Grass.C(), Grass.E(), Grass.D()).pushV(Grass.f(Grass.C(), Grass.E()));
        Grass.MC(Grass.C(), Grass.E(), Grass.D()).pushC(Grass.C());
        Grass.MC(Grass.C(), Grass.E(), Grass.D()).popI();

        Grass.TRUE();

        Grass.FALSE();

        Grass.w(0).toString();
        await Grass.w(0).apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.w(0));
        await Grass.w(0).apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.w(1));
        try { Grass.w(0).C(); } catch (error) { }
        try { Grass.w(0).E(); } catch (error) { }
        Grass.w(0).n();

        Grass.Out(async (n) => { }).toString();
        await Grass.Out(async (n) => { }).apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.w(0));
        try { Grass.Out(async (n) => { }).C(); } catch (error) { }
        try { Grass.Out(async (n) => { }).E(); } catch (error) { }
        try { Grass.Out(async (n) => { }).n(); } catch (error) { }

        Grass.In(async () => 0).toString();
        await Grass.In(async () => 0).apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.w(0));
        await Grass.In(async () => -1).apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.w(0));
        try { Grass.In(async () => 0).C(); } catch (error) { }
        try { Grass.In(async () => 0).E(); } catch (error) { }
        try { Grass.In(async () => 0).n(); } catch (error) { }

        Grass.Succ().toString();
        await Grass.Succ().apply(Grass.MC(Grass.C(), Grass.E(), Grass.D()), Grass.w(0));
        try { Grass.Succ().C(); } catch (error) { }
        try { Grass.Succ().E(); } catch (error) { }
        try { Grass.Succ().n(); } catch (error) { }

        Grass.run(Grass.C());
        await Grass.run(Grass.parse(fs.readFileSync('./examples/helloworld.grass', 'utf8')));
        await Grass.run(Grass.parse(fs.readFileSync('./examples/helloworld2.grass', 'utf8')));

    });

});
