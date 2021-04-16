import { Exp, makeAppExp, makeBoolExp, makePrimOp, Program,Binding, IfExp, CExp, isCExp, makeIfExp, makeLitExp, makeProcExp, makeVarDecl, makeVarRef, ProcExp, ClassExp, isAtomicExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, isVarDecl, isIfExp, isAppExp, isClassExp, makeBinding, isLitExp ,isLetExp, isProcExp, makeLetExp, isCompoundExp, isProgram, makeProgram, makeDefineExp, isExp } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { map } from "ramda";
import { first, rest } from "../shared/list";
import { makeSymbolSExp } from "../imp/L3-value";
import { isDefineExp } from "../imp/L3-ast";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/


export const class2proc = (exp: ClassExp): ProcExp =>  makeProcExp(exp.fields, [makeProcExp([makeVarDecl("msg")],[class2If(exp.methods)])])
   
export const class2If = (binding:Binding[]): IfExp   =>
    binding.length === 1
    ? makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef('msg'), makeLitExp(makeSymbolSExp(first(binding).var.var))]),
                makeAppExp(first(binding).val,[]),
                makeBoolExp(false))
    : makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef('msg'), makeLitExp(makeSymbolSExp(first(binding).var.var))]),
                makeAppExp(first(binding).val,[]), 
                class2If(rest(binding))) 


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const L31ExpToL3Exp = (exp : Exp):Exp => 
    isDefineExp(exp)
     ? makeDefineExp(exp.var, replaceAllClassExp(exp.val))
     : isCExp(exp) ? replaceAllClassExp(exp) : exp


     
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isExp(exp)? makeOk(L31ExpToL3Exp(exp)) :
    isProgram(exp) ? makeOk(makeProgram(map(L31ExpToL3Exp,exp.exps))) : makeFailure("Wrong program")
    

export const replaceAllClassExp = (exp:CExp):CExp  =>
isBoolExp(exp) ? exp :
isNumExp(exp) ? exp :
isStrExp(exp) ? exp :
isPrimOp(exp) ? exp :
isVarRef(exp) ? exp :
isVarDecl(exp) ? exp :
isClassExp(exp) ? class2proc(exp):
isIfExp(exp) ? makeIfExp(replaceAllClassExp(exp.test),replaceAllClassExp(exp.then),replaceAllClassExp(exp.alt)):
isAppExp(exp) ? makeAppExp(replaceAllClassExp(exp.rator),map(replaceAllClassExp,exp.rands)):
isProcExp(exp) ? makeProcExp(exp.args,map(replaceAllClassExp,exp.body)):
isLetExp(exp) ? makeLetExp( map( (binding:Binding)=> makeBinding(binding.var.var,replaceAllClassExp(binding.val)), exp.bindings),map(replaceAllClassExp,exp.body)):
isLitExp(exp) ? exp : exp 
