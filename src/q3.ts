import { /*ClassExp, ProcExp, */ Exp, makeAppExp, makeBoolExp, makePrimOp, Program } from "./L31-ast";
import { Result, makeFailure } from "../shared/result";
import { Binding, IfExp,AppExp, CExp, isCExp, makeIfExp, makeLitExp, makeProcExp, makeVarDecl, makeVarRef } from "../imp/L3-ast";
import { all, last, map, reduce, zipWith } from "ramda";
import { first, second } from "../shared/list";
import { makeSymbolSExp } from "../imp/L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
//( lambda ( <var>* ) <cexp>+ ) / ProcExp(args:VarDecl[], body:CExp[]))
/*const rewriteIf = (exp: IfExp): CondExp =>
    makeCondExp([
        makeCondClause(exp.test, [exp.then]),
        makeCondClause(makeBoolExp(true), [exp.alt])
       makeCondClause(makeBoolExp(true), [exp.alt])
    ]);
    (define pair
        (lambda (a b)
            (lambda (msg)
            (if (eq? msg 'first)
                ((lambda () a) )
                (if (eq? msg 'second)
                        ((lambda () b) )
                        (if (eq? msg 'sum)
                            (lambda () (+ a b)) )
                            #f))))))
                            (define pair
(class (a b)
    ((first (lambda () a))
    (second (lambda () b))
    (sum (lambda () (+ a b)))
*/


export const class2proc = (exp: ClassExp): ProcExp =>

    const test = makeProcExp([makeVarDecl('msg')],[class2If(exp.metods)])
    // ( if <cexp> <cexp> <cexp> )   / IfExp(test: CExp, then: CExp, alt: CExp)
    //  <var> ::= <identifier>                   / VarRef(var:string)
    //      |  ( if <cexp> <cexp> <cexp> )   / IfExp(test: CExp, then: CExp, alt: CExp)
    // |  ( <cexp> <cexp>* )            / AppExp(operator:CExp, operands:CExp[]))
   // makeCondClause(makeBoolExp(true), [exp.alt])
/*]);
(define pair
    (lambda (a b)
        (lambda (msg)
        (if (eq? msg 'first)
            ((lambda () a) )
            (if (eq? msg 'second)
                    ((lambda () b) )
                    (if (eq? msg 'sum)
                        (lambda () (+ a b)) )
                        #f))))))
                        (define pair
(class (a b)
((first (lambda () a))
(second (lambda () b))
(sum (lambda () (+ a b)))
*/
export const class2If = (binding:Binding[]):IfExp => {
    const appexp = makeAppExp(makePrimOp("eq?"),[makeVarRef('msg'),makeLitExp(makeSymbolSExp(first(binding).var.var))])
    binding.length===1?
    makeIfExp(appexp,first(binding).val,makeBoolExp(false)):
    makeIfExp(appexp,first(binding).val,class2proc(second(binding)) 
    
    

    

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    makeFailure("TODO");
