/*!
 * grassjs/types/index.d.ts
 * e53e04ac <e53e04ac@gmail.com>
 * MIT License
 */

export namespace Grass {

    interface Instruction {
        toString(): string;
        evaluate(MC: MachineConfiguration): Promise<void>;
    }

    interface FunctionApplication extends Instruction {

    }

    interface FunctionAbstraction extends Instruction {

    }

    interface Code {
        toString(): string;
        push(I: Instruction): void;
        pop(): undefined | Instruction;
        clone(): Code;
    }

    interface Environment {
        toString(): string;
        push(f: SemanticObject): void;
        get(i: number): SemanticObject;
        clone(): Environment;
    }

    interface Dump {
        toString(): string;
        push(f: SemanticObject): void;
        pop(): undefined | SemanticObject;
    }

    interface SemanticObject {
        toString(): string;
        apply(MC: MachineConfiguration, f: SemanticObject): Promise<void>;
        C(): Code;
        E(): Environment;
        n(): number;
    }

    interface MachineConfiguration {
        toString(): string;
        pushCE(f: SemanticObject): void;
        popCE(): boolean;
        getV(i: number): SemanticObject;
        pushV(f: SemanticObject): void;
        pushC(C: Code): void;
        popI(): undefined | Instruction;
    }

    interface TRUE extends SemanticObject {

    }

    interface FALSE extends SemanticObject {

    }

    interface Character extends SemanticObject {

    }

    interface Out extends SemanticObject {

    }

    interface In extends SemanticObject {

    }

    interface Succ extends SemanticObject {

    }

    interface Grass {
        App(m: number, n: number): FunctionApplication;
        Abs(n: number, C: Code): FunctionAbstraction;
        C(I?: Instruction | Instruction[]): Code;
        E(f?: SemanticObject | SemanticObject[]): Environment;
        D(f?: SemanticObject | SemanticObject[]): Dump;
        f(C: Code, E: Environment): SemanticObject;
        MC(C: Code, E: Environment, D: Dump): MachineConfiguration;
        TRUE(): TRUE;
        FALSE(): FALSE;
        w(n: number): Character;
        Out(write: { (n: number): Promise<void>; }): Out;
        In(read: { (): Promise<number>; }): In;
        Succ(): Succ;
        parse(string: string): Code;
        run(prog: Code): Promise<void>;
    }

    type ParserState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

    type ParserInputCharacter = '.' | 'W' | 'v' | 'w';

    type ParserStateContext = {
        readonly code: Code;
        readonly state: ParserState;
        readonly abs_n: null | number;
        readonly abs_C: null | Code;
        readonly app_m: null | number;
        reject(message?: string): never;
        next(context: Partial<ParserStateContext>): ParserStateContext;
        absEnd(): ParserStateContext;
        absBegin(abs_n: number): ParserStateContext;
        appBegin(app_m: number): ParserStateContext;
        appEnd(app_n: number): ParserStateContext;
        absAppEnd(app_n: number): ParserStateContext;
    };

    type ParserStateTransitionTable = Record<ParserState, Record<ParserInputCharacter, {
        (context: ParserStateContext, length: number): ParserStateContext;
    }>>;

}

export const Grass: Grass.Grass;
