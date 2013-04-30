///<reference path='references.ts' />

module TypeScript {
    export class SyntaxUtilities {
        public static isAngleBracket(positionedElement: PositionedElement): boolean {
            var element = positionedElement.element();
            var parent = positionedElement.parentElement();
            if (parent !== null && (element.kind() === SyntaxKind.LessThanToken || element.kind() === SyntaxKind.GreaterThanToken)) {
                switch (parent.kind()) {
                    case SyntaxKind.TypeArgumentList:
                    case SyntaxKind.TypeParameterList:
                    case SyntaxKind.CastExpression:
                        return true;
                }
            }

            return false;
        }
    }
}