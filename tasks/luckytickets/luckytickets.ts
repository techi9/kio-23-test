import './luckytickets.scss'
import {KioApi, KioTask, KioParameterDescription, KioResourceDescription, KioTaskSettings} from "../KioApi";

enum OperatorsList {
    IF = 'ЕСЛИ',
    THEN = 'ТО',
    ELSE = 'ИНАЧЕ',
    AND = 'И',
    LT = '<',
    LTE = '<=',
    GT = '>',
    GTE = '>=',
    EQUALS = '=',
    PLUS = '+',
    MINUS = '-',
    MULT = '*',
    DIVISION = '/',
    POW = '^'
}

type ArithmeticOperator = 'PLUS' | 'MINUS' | 'MULT' | 'DIVISION' | 'POWER' | 'RADICAL';
type MathOperation = '+' | '-' | '*' | '/' | '**' | 'SQRT' | '';
type Comparator = '===' | 'LT' | 'LTE' | 'GT' | 'GTE';
type Conditionals = 'IF' | 'THEN' | 'ELSE';

interface BaseToken {
    operation: MathOperation;
    operands: any[];
}

interface ConditionFraction {
    conditional: Conditionals | string;
    expression: string;
}

interface ComparatorFraction {
    comparator: Comparator | string;
    leftComparable: string;
    rightComparable: string;
}

interface FunctionComposit {
    condition: ConditionFraction;
    comparison: ComparatorFraction;
    tokens: BaseToken[];
}

// interface TokenTypes {
//     numeric: number;
//     identifier: string;
//     arithmetic: ArithmeticOperator;
//     logical:
// }

export class Luckytickets implements KioTask {
    private settings: KioTaskSettings;
    private kioapi: KioApi;
    private domNode: HTMLElement;
    private storedInput = '';
    private linesCount = 1;
    private linesArray = [1];

    constructor(settings: KioTaskSettings) {
        this.settings = settings;
    }

    id() {
        return "luckytickets" + this.settings.level;
    }

    initialize(domNode: HTMLElement, kioapi: KioApi, preferred_width: number) {
        console.log('preferred width in problem initialization', preferred_width);

        this.kioapi = kioapi;
        this.domNode = domNode;

        console.log('problem level is', this.settings.level);
        const ticketsContainer = document.createElement('div');
        ticketsContainer.className = 'tickets-container';
        this.domNode.appendChild(ticketsContainer);

        const inputTicketContainer = document.createElement('div');
        inputTicketContainer.className = 'input-ticket-container';

        const inputTicketTitle = document.createElement('div');
        inputTicketTitle.className = 'input-ticket-title';
        inputTicketTitle.innerText = 'Текущий номер билета';
        inputTicketContainer.appendChild(inputTicketTitle);

        const inputTicketImage = document.createElement('div');
        inputTicketImage.className = 'input-ticket-image';
        inputTicketImage.innerHTML = '<input maxlength="6" class="input-number" placeholder="abcdef">';
        inputTicketContainer.appendChild(inputTicketImage);
        inputTicketImage.addEventListener('input', (event: InputEvent) => {
            // Add input validation
            // Show error message for incorrect input
            // Pass input to algorithm
            // Specify max length as variable
            if (event?.data) {
                this.storedInput += event.data;
            }
        });

        ticketsContainer.appendChild(inputTicketContainer);

        const outputTicketContainer = document.createElement('div');
        outputTicketContainer.className = 'output-ticket-container';

        const outputTicketTitle = document.createElement('div');
        outputTicketTitle.className = 'output-ticket-title';
        outputTicketTitle.innerText = 'Следующий счастливый билет';
        outputTicketContainer.appendChild(outputTicketTitle);

        const outputTicketImage = document.createElement('div');
        outputTicketImage.className = 'output-ticket-image';
        outputTicketImage.innerHTML = '<input disabled class="output-number" id="output-field" placeholder="xyzuvw">';
        outputTicketContainer.appendChild(outputTicketImage);

        ticketsContainer.appendChild(outputTicketContainer);

        const codeEditor = document.createElement('div');
        codeEditor.className = 'code-editor';
        codeEditor.innerHTML = '<div class="code-editor-header" id="code-editor-header-id"></div><div class="code-lines" id="ruler"></div><textarea id="text-from-editor"></textarea>';

        this.domNode.appendChild(codeEditor);

        const infoIcon = document.createElement('div');
        infoIcon.className = 'info-icon';
        const editorHeader = document.getElementById('code-editor-header-id');
        editorHeader.appendChild(infoIcon);

        const editorElement = <HTMLTextAreaElement>document.getElementById('text-from-editor');
        
        if (editorElement) {
            const ruler = document.getElementById('ruler');
            ruler.innerHTML = `<div class="line-number" id="${this.linesArray[0].toString()}">${this.linesArray[0].toString()}</div>`;
        }
        editorElement.addEventListener('keydown', (event) => {
            if (editorElement?.value) {
                this.updateRuler(editorElement.value);
            }
        });


        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        this.domNode.appendChild(buttonsContainer);

        const stepPlusButton = document.createElement('button');
        stepPlusButton.className = 'step-plus-button';
        stepPlusButton.innerText = 'ШАГ +';
        buttonsContainer.appendChild(stepPlusButton);
        stepPlusButton.addEventListener('click', (event) => {
        });

        const instantResultButton = document.createElement('button');
        instantResultButton.innerText = 'МГНОВЕННЫЙ РЕЗУЛЬТАТ';
        instantResultButton.className = 'instant-result-button';
        buttonsContainer.appendChild(instantResultButton);
        instantResultButton.addEventListener('click', (event) => {
            if (this.storedInput?.length) {
                const outputField = <HTMLInputElement>document.getElementById('output-field');
                if (outputField) {
                    outputField.value = this.storedInput;
                }
            }
        });

        const stepMinusButton = document.createElement('button');
        stepMinusButton.innerText = 'ШАГ -';
        stepMinusButton.className = 'step-minus-button';
        buttonsContainer.appendChild(stepMinusButton);
        stepMinusButton.addEventListener('click', (event) => {
        });

        const demoButton = document.createElement('button');
        demoButton.innerText = 'РЕЖИМ ДЕМОНСТРАЦИИ';
        demoButton.className = 'demo-button';
        buttonsContainer.appendChild(demoButton);
        demoButton.addEventListener('click', (event) => {
            if (editorElement?.value) {
                // if (editorElement.value.toUpperCase() === 'ПЕЧАТЬ' && this.storedInput?.length) {
                //     alert(`Your Input IS ${this.storedInput}`);
                // } else if (!this.storedInput.length && editorElement.value.toUpperCase() === 'ПЕЧАТЬ') {
                //     alert('NO INPUT');
                //  } else {
                //     alert('UNKNOWN FUNCTION');
                // }
                const rawDataArray = this.splitLines(editorElement.value);
                const jsFunctionString = this.constructJSFunction(rawDataArray);
                // console.log('\n','\n','\n',jsFunctionString);
                // this.callJSFunction(jsFunctionString);
            }
        });

        const animationButton = document.createElement('button');
        animationButton.innerText = 'АНИМАЦИЯ ПЕРЕБОРА';
        animationButton.className = 'animation-button';
        buttonsContainer.appendChild(animationButton);
        animationButton.addEventListener('click', (event) => {
        });
    }

    private updateRuler(value: string): void {
        const ruler = document.getElementById('ruler');
        const lines = value.split(/\r*\n/);
        this.linesCount = lines.length;

        if (this.linesArray[this.linesArray.length - 1] === this.linesCount) {
            return;
        } else if (this.linesCount < this.linesArray[this.linesArray.length - 1]) {
            ruler.removeChild(ruler.lastChild);
            this.linesArray.pop();
            return;
        }
        this.linesArray.push(this.linesCount);
        const elem = document.createElement("div");
        elem.setAttribute('id', this.linesCount.toString());
        elem.className = 'line-number';
        elem.innerText = this.linesCount.toString();
        ruler.appendChild(elem);
    }

    private splitLines(editorValue: string): string[] {
        const codeLines = editorValue.split(/\r*\n/);
        return codeLines;
    }

    private constructJSFunction(rawDataArray: string[]): string {
        const processedData = this.processRawData(rawDataArray).join('');
        return processedData;
    }

    // Think how to call functions recursively
    // Think about brakets

    private processRawData(rawDataArray: string[]): string[] {
        const processedData: string[] = [];
        rawDataArray.forEach((rawLine) => {
            const conditionFractionInstance = this.extractConditional(rawLine);
            const comparatorFractionInstance = this.extractComparator(conditionFractionInstance);

            const decomposedLeftComparable = !this.codeContainsOperand(comparatorFractionInstance.leftComparable) ? comparatorFractionInstance.leftComparable : this.isSimpleExpression(comparatorFractionInstance.leftComparable) ? this.extractMathOperator(comparatorFractionInstance.leftComparable) : this.keepDecomposing(comparatorFractionInstance.leftComparable);

            const decomposedRightComparable = !this.codeContainsOperand(comparatorFractionInstance.rightComparable) ? comparatorFractionInstance.rightComparable : this.isSimpleExpression(comparatorFractionInstance.rightComparable) ? this.extractMathOperator(comparatorFractionInstance.rightComparable) : this.keepDecomposing(comparatorFractionInstance.rightComparable);
            // const jsLine = this.constructJSLine(conditionFractionInstance, comparatorFractionInstance, decomposedLeftComparable, decomposedRightComparable);
            // console.log('JS Line', jsLine);

        //     const lineTokens = codeLine.split(' ');
        //     const interpretedLines: string[] = [];
        //     lineTokens.forEach((token, index, lineTokens) => {
        //         if (lineTokens.indexOf(OperatorsList.IF) !== -1) {
        //             if (token === OperatorsList.IF) {
        //                 interpretedLines.push('if(');
        //             } else if (index === lineTokens.length - 1) {
        //                 if (token.indexOf(OperatorsList.POW) !== -1) {
        //                     interpretedLines.push(token.replace(OperatorsList.POW, '**'));
        //                     interpretedLines.push(')');
        //                 } else {
        //                     interpretedLines.push(token + ')');
        //                 }
        //             } else if (token === OperatorsList.EQUALS) {
        //                 interpretedLines.push(')===(');
        //             } else if (token.indexOf(OperatorsList.POW) !== -1) {
        //                 interpretedLines.push(token.replace(OperatorsList.POW, '**'));
        //             } else {
        //                 interpretedLines.push(token);
        //             }
        //         } else if (lineTokens.indexOf(OperatorsList.THEN) !== -1) {
        //             if (token === OperatorsList.THEN) {
        //                 interpretedLines.push('{');
        //             } else if (index === lineTokens.length - 1) {
        //                 if (token.indexOf(OperatorsList.POW) !== -1) {
        //                     interpretedLines.push(token.replace(OperatorsList.POW, '**'));
        //                     interpretedLines.push('}');
        //                 } else {
        //                     interpretedLines.push(token + '}');
        //                 }
        //             } else if (token.indexOf(OperatorsList.POW) !== -1) {
        //                 interpretedLines.push(token.replace(OperatorsList.POW, '**'));
        //                 if (index === lineTokens.length - 1) {
        //                     interpretedLines.push(')');
        //                 }
        //             } else {
        //                 interpretedLines.push(token);
        //             }
        //         } else if (lineTokens.indexOf(OperatorsList.ELSE) !== -1) {
        //             if (token === OperatorsList.ELSE) {
        //                 interpretedLines.push('else{');
        //             } else if (index === lineTokens.length - 1) {
        //                 interpretedLines.push(token + '}');
        //             } else if (token.indexOf(OperatorsList.POW) !== -1) {
        //                 interpretedLines.push(token.replace(OperatorsList.POW, '**'));
        //                 if (index === lineTokens.length - 1) {
        //                     interpretedLines.push(')');
        //                 }
        //             } else {
        //                 interpretedLines.push(token);
        //             }
        //         } else if (token.indexOf(OperatorsList.POW) !== -1) {
        //             interpretedLines.push(token.replace(OperatorsList.POW, '**'));
        //             if (index === lineTokens.length - 1) {
        //                 interpretedLines.push(')');
        //             }
        //         } else {
        //             interpretedLines.push(token);
        //         }
        //     });

        //     const mergedLine = interpretedLines.join('');

        //     processedData.push(mergedLine);
        });
        return processedData;
    }

    private complexExpressionTree: BaseToken = {
        operation: '',
        operands: []
    };

    private keepDecomposing(rawExpression: string, index?: number) {
        console.log('Complex expression', rawExpression);
        const lineWithoutSpaces = rawExpression.split(' ').join('');
        // Remove plus
        if (lineWithoutSpaces.includes(OperatorsList.PLUS)) {
            this.complexExpressionTree.operation = '+';
            this.complexExpressionTree.operands = this.findOperands(lineWithoutSpaces, OperatorsList.PLUS);
            console.log(this.complexExpressionTree);
            this.complexExpressionTree.operands.forEach((component, index, operands) => {
                if (this.codeContainsOperand(component)) {
                    // if (component.includes(OperatorsList.MINUS)) {
                    //     this.complexExpressionTree.operands[index].operation = '-';
                    //     this.complexExpressionTree.operands[index].operands =  this.findOperands(lineWithoutSpaces, OperatorsList.MINUS);
                    // }
                    this.keepDecomposing(component, index);
                }
            });
        } else if (lineWithoutSpaces.includes(OperatorsList.MINUS)) {
            this.complexExpressionTree.operands[index] = {
                operation: '-',
                operands: this.findOperands(lineWithoutSpaces, OperatorsList.MINUS)
            }
            // this.complexExpressionTree.operands[index].operation = '-';
            // this.complexExpressionTree.operands[index].operand = this.findOperands(lineWithoutSpaces, OperatorsList.MINUS);
            
            // this.complexExpressionTree.operation = '-';
            // this.complexExpressionTree.operands = this.findOperands(lineWithoutSpaces, OperatorsList.MINUS);
            // this.complexExpressionTree.operands.forEach((component, index, operands) => {
            //     if (this.codeContainsOperand(component)) {
            //         this.keepDecomposing(component);
            //     }
            // });
        } else if (lineWithoutSpaces.includes(OperatorsList.MULT)) {
            this.complexExpressionTree.operands[index] = {
                operation: '*',
                operands: this.findOperands(lineWithoutSpaces, OperatorsList.MULT)
            }
        } else if (lineWithoutSpaces.includes(OperatorsList.DIVISION)) {
            this.complexExpressionTree.operands[index] = {
                operation: '/',
                operands: this.findOperands(lineWithoutSpaces, OperatorsList.DIVISION)
            }
        }

        console.log('TREE', this.complexExpressionTree);
        // Remove minus
        // Remove multiplication
        // Remove division

    }

    private constructJSLine(conditionFractionInstance: ConditionFraction, comparatorFractionInstance: ComparatorFraction, decomposedLeftComparable: BaseToken, decomposedRightComparable: BaseToken): string {
        const constructedLine = '';
        // const constructedLine = `${conditionFractionInstance.conditional}((${decomposedLeftComparable.operands[0]}${decomposedLeftComparable.operation}${decomposedLeftComparable.operands[1]})${comparatorFractionInstance.comparator}(${decomposedRightComparable.operands[0]}${decomposedRightComparable.operation}${decomposedRightComparable.operands[1]}))`;
        return constructedLine;
    }

    // Add check for unsupported characters

    private codeContainsOperand(codeLine: string): boolean {
        const hasOperand = codeLine.includes(OperatorsList.PLUS) ||
            codeLine.includes(OperatorsList.MINUS) ||
            codeLine.includes(OperatorsList.MULT) ||
            codeLine.includes(OperatorsList.DIVISION) ||
            codeLine.includes(OperatorsList.POW);
        return hasOperand;
    }

    private extractConditional(codeLine: string): ConditionFraction {
        // Check when code starts from new string without conditional on it
        const rawCodeLine = {
            conditional: '',
            expression: ''
        }
        if (codeLine.includes(OperatorsList.IF)) {
            rawCodeLine.conditional = 'IF';
            rawCodeLine.expression = codeLine.substring(OperatorsList.IF.length); 
        } else if (codeLine.includes(OperatorsList.ELSE)) {
            rawCodeLine.conditional = 'ELSE';
            rawCodeLine.expression = codeLine.substring(OperatorsList.ELSE.length); 
        } else if (codeLine.includes(OperatorsList.THEN)) {
            rawCodeLine.conditional = 'THEN';
            rawCodeLine.expression = codeLine.substring(OperatorsList.THEN.length); 
        }

        return rawCodeLine;
    }

    private extractComparator(codeLine: ConditionFraction): ComparatorFraction {
        const decomposedLine = {
            comparator: '',
            leftComparable: '',
            rightComparable: ''
        }

        if (codeLine.expression.includes(OperatorsList.EQUALS)) {
            decomposedLine.comparator = '===';
            decomposedLine.leftComparable = codeLine.expression.split(OperatorsList.EQUALS)[0]; 
            decomposedLine.rightComparable = codeLine.expression.split(OperatorsList.EQUALS)[1]; 
        } else if (codeLine.expression.includes(OperatorsList.LT)) {
            decomposedLine.comparator = 'LT';
            decomposedLine.leftComparable = codeLine.expression.split(OperatorsList.LT)[0]; 
            decomposedLine.rightComparable = codeLine.expression.split(OperatorsList.LT)[1]; 
        } else if (codeLine.expression.includes(OperatorsList.LTE)) {
            decomposedLine.comparator = 'LTE';
            decomposedLine.leftComparable = codeLine.expression.split(OperatorsList.LTE)[0]; 
            decomposedLine.rightComparable = codeLine.expression.split(OperatorsList.LTE)[1]; 
        } else if (codeLine.expression.includes(OperatorsList.GT)) {
            decomposedLine.comparator = 'GT';
            decomposedLine.leftComparable = codeLine.expression.split(OperatorsList.GT)[0]; 
            decomposedLine.rightComparable = codeLine.expression.split(OperatorsList.GT)[1]; 
        } else if (codeLine.expression.includes(OperatorsList.GTE)) {
            decomposedLine.comparator = 'GTE';
            decomposedLine.leftComparable = codeLine.expression.split(OperatorsList.GTE)[0]; 
            decomposedLine.rightComparable = codeLine.expression.split(OperatorsList.GTE)[1]; 
        }
        return decomposedLine;
    }

    private extractMathOperator(rawCodeLine: string): BaseToken {
        const lineWithoutSpaces = rawCodeLine.split(' ').join('');
        const decomposedLine: BaseToken = {
            operation: '',
            operands: [],
        }

        if (lineWithoutSpaces.includes(OperatorsList.PLUS)) {
            decomposedLine.operation = '+';
            decomposedLine.operands = this.findOperands(lineWithoutSpaces, OperatorsList.PLUS);
            // const inputs = lineWithoutSpaces.split(OperatorsList.PLUS);
            // if (this.isSimpleExpression(codeLine)) {
            //     decomposedLine.leftOperand = inputs[0];
            //     decomposedLine.rightOperand = inputs[1];
            // } else {
            //     // if type of left operand or right operand is not number or string call this function again
            //     decomposedLine.leftOperand = inputs[0];
            //     const signIndex = lineWithoutSpaces.indexOf(OperatorsList.PLUS);
            //     const notProcessedString = lineWithoutSpaces.substring(signIndex + 1, codeLine.length);
            //     decomposedLine.rightOperand = notProcessedString;
            // }
        } else if (lineWithoutSpaces.includes(OperatorsList.MINUS)) {
            decomposedLine.operation = '-';
            decomposedLine.operands = this.findOperands(lineWithoutSpaces, OperatorsList.MINUS);
        } else if (lineWithoutSpaces.includes(OperatorsList.MULT)) {
            decomposedLine.operation = '*';
            decomposedLine.operands = this.findOperands(lineWithoutSpaces, OperatorsList.MULT);
        } else if (lineWithoutSpaces.includes(OperatorsList.DIVISION)) {
            decomposedLine.operation = '/';
            decomposedLine.operands = this.findOperands(lineWithoutSpaces, OperatorsList.DIVISION);
        } else if (lineWithoutSpaces.includes(OperatorsList.POW)) {
            decomposedLine.operation = '**';
            decomposedLine.operands = this.findOperands(lineWithoutSpaces, OperatorsList.POW);
        }
        return decomposedLine;
    }

    private findOperands(lineWithoutSpaces: string, operator: string): string[] {
        const tokens: string[] = [];
        const arrayWithoutOperand = lineWithoutSpaces.split(operator);
        arrayWithoutOperand.forEach((operand) => {
            tokens.push(operand);
        });
        return tokens;

    }

    // a + b
    // a * b
    // a - b
    // a / b
    private isSimpleExpression(rawExpression: string): boolean {
        const expression = rawExpression.split(' ').join('');
        const simpleExpression = expression && expression.length === 3 &&
        this.codeContainsOperand(rawExpression) &&
        (typeof expression[0] === 'string' || typeof expression[2] === 'number');
        return simpleExpression;
    }

    private callJSFunction(jsString: string): void {

    }

    parameters(): KioParameterDescription[] {
        return [
            {
                name: "steps",
                title: "Количество шагов",
                ordering: 'maximize',
                view: "ш"
            },
            {
                name: "max",
                title: "Максимальное число",
                ordering: 'minimize',
                view: function (val) {
                    return '[' + val + ']'
                }
            }
        ];
    }

    /*static preloadManifest(): KioResourceDescription[] {
        return [
            {id: "1", src: "collatz_es_next-resources/collatz_conjecture.png"}
        ];
    };*/

    solution(): Solution {
        return {};
    };

    loadSolution(solution: Solution): void {
    }
}

interface Solution {
}
