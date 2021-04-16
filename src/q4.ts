import { map } from 'ramda';
import { Exp, isBoolExp, isExp, isProgram, Program, isNumExp, isStrExp ,isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isDefineExp, ProcExp, VarDecl, PrimOp, AppExp, CExp, IfExp } from '../imp/L3-ast';
import { valueToString } from '../imp/L3-value';
import { Result, makeOk, makeFailure } from '../shared/result';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isExp(exp)? makeOk(L2ExpToPythonExp(exp)) :
    isProgram(exp) ? makeOk(map(L2ExpToPythonExp,exp.exps).join('\n')) : makeFailure("Wrong input")

export const proc2Python = (pe:ProcExp):string =>
`(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${L2ExpToPythonExp(pe.body[0])})`


const parsePrimOp = (str: string): string =>
    ["+", "-", "*", "<", ">", "/", "not", "or", "and"].includes(str) ? str :
    str === "=" || str === "eq?" ? "==" :
    str === "boolean?" ? "lambda x : (type(x) == bool)" :
    str === "number?" ? "lambda x : ((type(x) == int) or (type(x) == float))" :
    ""


export const isSimpleOp = (exp: Exp): boolean =>
    isPrimOp(exp) 
        ? ["+", "-", "*", "<", ">", "/", "=", "eq?", "or", "and"].includes(exp.op)
        : false

export const parseIfExpToPython = (exp: IfExp): string =>
    `(${L2ExpToPythonExp(exp.then)} if ${L2ExpToPythonExp(exp.test)} else ${L2ExpToPythonExp(exp.alt)})`

export const parseComplexPrimOp = (exp: AppExp): string =>
    isPrimOp(exp.rator) 
        ? exp.rator.op === "not"
            ? `(not ${ map(L2ExpToPythonExp, exp.rands).join(" ")})`
            :`(${parsePrimOp(exp.rator.op)})(${ map(L2ExpToPythonExp, exp.rands).join(" ")})`: 
    isProcExp(exp.rator) ? `${proc2Python(exp.rator)}(${ map(L2ExpToPythonExp, exp.rands).join(",")})`:
    isVarRef(exp.rator) ? `${exp.rator.var}(${ map(L2ExpToPythonExp, exp.rands).join(',')})`:
    isIfExp(exp.rator) ? `(${parseIfExpToPython(exp.rator)}) (${map(L2ExpToPythonExp, exp.rands).join(",")})`:
    isAppExp(exp.rator) ? `(${parseAppExpToPython(exp.rator)}) (${map(L2ExpToPythonExp, exp.rands).join(",")})`: ""


export const parseAppExpToPython = (exp: AppExp): string =>
    isSimpleOp(exp.rator)
        ? `(${ map(L2ExpToPythonExp, exp.rands).join(" " + L2ExpToPythonExp(exp.rator)+ " ")})`
        : parseComplexPrimOp(exp)

export const L2ExpToPythonExp = (exp:Exp): string => 
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isStrExp(exp) ? valueToString(exp.val) :
    isVarRef(exp) ? exp.var :
    isProcExp(exp) ? proc2Python(exp) :
    isIfExp(exp) ? parseIfExpToPython(exp) :
    isAppExp(exp) ? parseAppExpToPython(exp) : 
    isPrimOp(exp) ? parsePrimOp(exp.op) :
    isDefineExp(exp) ? `${exp.var.var} = ${L2ExpToPythonExp(exp.val)}`:
    ""
   
