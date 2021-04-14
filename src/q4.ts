import { is, map } from 'ramda';
import { Exp, isBoolExp, isExp, isProgram, Program, isNumExp, isStrExp ,isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isDefineExp, ProcExp, VarDecl, PrimOp, AppExp, CExp } from '../imp/L3-ast';
import { valueToString } from '../imp/L3-value';
import { Result, makeFailure, makeOk } from '../shared/result';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/

export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isExp(exp)? makeOk(L2ExpToPythonExp(exp)) :
    isProgram(exp) ? makeOk(map(L2ExpToPythonExp,exp.exps).join('\n')) : makeOk(exp)

export const proc2Python = (pe:ProcExp):string =>
`(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${L2ExpToPythonExp(pe.body[0])})`

// export const l2toPythonLExps = (les: Exp[]): string => {
//     const oper = les[0]
//     if(isPrimOp(oper)) {
//         const op = oper.op
//         if(isOp(op) ){
//             return `( ${L2ExpToPythonExp(les[1])} ${op} ${L2ExpToPythonExp(les[2])} `
//         } 
//         else if(op=== 'boolean?'){
//             return '(lambda x : (type(x) == bool)'
//         }
//         else if(op ==='number?' ){
//             return '(lambda x : (type(x) == int or type(x)==float))'
//         }
//         else if(op === "="){
//             return `( ${L2ExpToPythonExp(les[1])} ${op}${op} ${L2ExpToPythonExp(les[2])} `

//         }
//         else if(op === "eq?"){
//             return `( if(${L2ExpToPythonExp(les[1])} == {L2ExpToPythonExp(les[2])}) `
//         }
//         else{
//             return "antoer day"
//         }

//     }
//     else{
//         return "never"
//     }
        
        
// }
const parsePrimOp = (str:string):string =>
    str === "+" ? "+":
    str === "-" ? "-":
    str === "*" ? "*":
    str === "<" ? "<":
    str === ">" ? ">":
    str === "/" ? "/":
    str === "=" || str === "eq?" ? "=="://TODO: check later
    str === "not" ? "not":
    str === "and" ? "and":
    str === "or" ? "or":
    str === "boolean?" ? "(lambda x : (type(x) == bool))":
    str === "number?" ? "(lambda x : (type(x) == int or type(x) == float))":
    ""


export const isSimpleOp = (exp: Exp): boolean =>
    isPrimOp(exp) 
        ? ["+", "-", "*", "<", ">", "/", "=", "eq?", "or", "and"].includes(exp.op)
        : false


export const parseComplexPrimOp = (exp: AppExp): string =>
    isPrimOp(exp.rator) 
        ? exp.rator.op === "not" 
            ? `(not ${ map(L2ExpToPythonExp, exp.rands).join(" ")})`
            :`(${parsePrimOp(exp.rator.op)} ${ map(L2ExpToPythonExp, exp.rands).join(" ")})`
        : isProcExp(exp.rator) 
            ? `${proc2Python(exp.rator)}(${ map(L2ExpToPythonExp, exp.rands).join(" ")})`
            : isVarRef(exp.rator) ? `${exp.rator.var}(${ map(L2ExpToPythonExp, exp.rands).join(',')})`:""


export const parseAppExpToPython = (exp: AppExp): string =>
    isSimpleOp(exp.rator)
        ? `(${ map(L2ExpToPythonExp, exp.rands).join(" " + L2ExpToPythonExp(exp.rator)+ " ")})`
        : parseComplexPrimOp(exp)
    
            //then 'if' test 'else' alt
export const L2ExpToPythonExp = (exp:Exp):string => 
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isStrExp(exp) ? valueToString(exp.val) :
    isVarRef(exp) ? exp.var :
    isProcExp(exp) ? proc2Python(exp) :
    isIfExp(exp) ? `(${L2ExpToPythonExp(exp.then)} if ${L2ExpToPythonExp(exp.test)} else ${L2ExpToPythonExp(exp.alt)})` :
    isAppExp(exp) ? parseAppExpToPython(exp): 
    isPrimOp(exp) ? parsePrimOp(exp.op) :
    isDefineExp(exp) ? `${exp.var.var} = ${L2ExpToPythonExp(exp.val)}` :
    "never";
   /* ;; =============================================================================
;; Scheme Parser
;;
;; L2 extends L1 with support for IfExp and ProcExp
;; L31 extends L2 with support for:
;; - Pair datatype
;; - The empty-list literal expression
;; - Compound literal expressions denoted with quote
;; - Primitives: cons, car, cdr, pair?, number?, boolean?, symbol?, string?, list
;; - Primitives: and, or, not
;; - The Let abbreviation is also supported.

;; <program> ::= (L31 <exp>+) // Program(exps:List(Exp))
;; <exp> ::= <define> | <cexp>              / DefExp | CExp
;; <define> ::= ( define <var> <cexp> )     / DefExp(var:VarDecl, val:CExp)
;; <var> ::= <identifier>                   / VarRef(var:string)
;; <cexp> ::= <number>                      / NumExp(val:number)
;;         |  <boolean>                     / BoolExp(val:boolean)
;;         |  <string>                      / StrExp(val:string)
;;         |  ( lambda ( <var>* ) <cexp>+ ) / ProcExp(args:VarDecl[], body:CExp[]))
;;         |  ( if <cexp> <cexp> <cexp> )   / IfExp(test: CExp, then: CExp, alt: CExp)
;;         |  ( <cexp> <cexp>* )            / AppExp(operator:CExp, operands:CExp[]))
;; <prim-op>  ::= + | - | * | / | < | > | = | not |  and | or  |
;;                  | number? 
;;                  | boolean? | eq?|      ##### L3
;; <num-exp>  ::= a number token
;; <bool-exp> ::= #t | #f
;; <var-ref>  ::= an identifier token
;; <var-decl> ::= an identifier token
;; <sexp>     ::= symbol | number | bool | string | 
;;                (<sexp>+ . <sexp>) | ( <sexp>* )       ##### L3
*/
