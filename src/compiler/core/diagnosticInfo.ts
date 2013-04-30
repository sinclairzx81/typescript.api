///<reference path='references.ts' />

module TypeScript {
    export interface DiagnosticInfo {
        category: DiagnosticCategory;
        code: number;
    }

    export var DiagnosticInfoMap = {
        "error TS{0}: {1}": {
            category: DiagnosticCategory.Message,
            code: 0
        },
        "warning TS{0}: {1}": {
            category: DiagnosticCategory.Message,
            code: 1
        },

        // Syntactic diagnostics.
        "Unrecognized escape sequence.": {
            category: DiagnosticCategory.Error,
            code: 1000
        },
        "Unexpected character {0}.": {
            category: DiagnosticCategory.Error,
            code: 1001
        },
        "Missing close quote character.": {
            category: DiagnosticCategory.Error,
            code: 1002
        },
        "Identifier expected.": {
            category: DiagnosticCategory.Error,
            code: 1003
        },
        "'{0}' keyword expected.": {
            category: DiagnosticCategory.Error,
            code: 1004
        },
        "'{0}' expected.": {
            category: DiagnosticCategory.Error,
            code: 1005
        },
        "Identifier expected; '{0}' is a keyword.": {
            category: DiagnosticCategory.Error,
            code: 1006
        },
        "Automatic semicolon insertion not allowed.": {
            category: DiagnosticCategory.Error,
            code: 1007
        },
        "Unexpected token; '{0}' expected.": {
            category: DiagnosticCategory.Error,
            code: 1008
        },
        "Trailing separator not allowed.": {
            category: DiagnosticCategory.Error,
            code: 1009
        },
        "'*/' expected.": {
            category: DiagnosticCategory.Error,
            code: 1010
        },
        "'public' or 'private' modifier must precede 'static'.": {
            category: DiagnosticCategory.Error,
            code: 1011
        },
        "Unexpected token.": {
            category: DiagnosticCategory.Error,
            code: 1012
        },
        "A catch clause variable cannot have a type annotation.": {
            category: DiagnosticCategory.Error,
            code: 1013
        },
        "Rest parameter must be last in list.": {
            category: DiagnosticCategory.Error,
            code: 1014
        },
        "Parameter cannot have question mark and initializer.": {
            category: DiagnosticCategory.Error,
            code: 1015
        },
        "required parameter cannot follow optional parameter.": {
            category: DiagnosticCategory.Error,
            code: 1016
        },
        "Index signatures cannot have rest parameters.": {
            category: DiagnosticCategory.Error,
            code: 1017
        },
        "Index signature parameter cannot have accessibility modifiers.": {
            category: DiagnosticCategory.Error,
            code: 1018
        },
        "Index signature parameter cannot have a question mark.": {
            category: DiagnosticCategory.Error,
            code: 1019
        },
        "Index signature parameter cannot have an initializer.": {
            category: DiagnosticCategory.Error,
            code: 1020
        },
        "Index signature must have a type annotation.": {
            category: DiagnosticCategory.Error,
            code: 1021
        },
        "Index signature parameter must have a type annotation.": {
            category: DiagnosticCategory.Error,
            code: 1022
        },
        "Index signature parameter type must be 'string' or 'number'.": {
            category: DiagnosticCategory.Error,
            code: 1023
        },
        "'extends' clause already seen.": {
            category: DiagnosticCategory.Error,
            code: 1024
        },
        "'extends' clause must precede 'implements' clause.": {
            category: DiagnosticCategory.Error,
            code: 1025
        },
        "Class can only extend single type.": {
            category: DiagnosticCategory.Error,
            code: 1026
        },
        "'implements' clause already seen.": {
            category: DiagnosticCategory.Error,
            code: 1027
        },
        "Accessibility modifier already seen.": {
            category: DiagnosticCategory.Error,
            code: 1028
        },
        "'{0}' modifier must precede '{1}' modifier.": {
            category: DiagnosticCategory.Error,
            code: 1029
        },
        "'{0}' modifier already seen.": {
            category: DiagnosticCategory.Error,
            code: 1030
        },
        "'{0}' modifier cannot appear on a class element.": {
            category: DiagnosticCategory.Error,
            code: 1031
        },
        "Interface declaration cannot have 'implements' clause.": {
            category: DiagnosticCategory.Error,
            code: 1032
        },
        "'super' invocation cannot have type arguments.": {
            category: DiagnosticCategory.Error,
            code: 1034
        },
        "Non ambient modules cannot use quoted names.": {
            category: DiagnosticCategory.Error,
            code: 1035
        },
        "Statements are not allowed in ambient contexts.": {
            category: DiagnosticCategory.Error,
            code: 1036
        },
        "Implementations are not allowed in ambient contexts.": {
            category: DiagnosticCategory.Error,
            code: 1037
        },
        "'declare' modifier not allowed for code already in an ambient context.": {
            category: DiagnosticCategory.Error,
            code: 1038
        },
        "Initializers are not allowed in ambient contexts.": {
            category: DiagnosticCategory.Error,
            code: 1039
        },
        "Overload and ambient signatures cannot specify parameter properties.": {
            category: DiagnosticCategory.Error,
            code: 1040
        },
        "Function implementation expected.": {
            category: DiagnosticCategory.Error,
            code: 1041
        },
        "Constructor implementation expected.": {
            category: DiagnosticCategory.Error,
            code: 1042
        },
        "Function overload name must be '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 1043
        },
        "'{0}' modifier cannot appear on a module element.": {
            category: DiagnosticCategory.Error,
            code: 1044
        },
        "'declare' modifier cannot appear on an interface declaration.": {
            category: DiagnosticCategory.Error,
            code: 1045
        },
        "'declare' modifier required for top level element.": {
            category: DiagnosticCategory.Error,
            code: 1046
        },
        "Rest parameter cannot be optional.": {
            category: DiagnosticCategory.Error,
            code: 1047
        },
        "Rest parameter cannot have initializer.": {
            category: DiagnosticCategory.Error,
            code: 1048
        },
        "'set' accessor must have one and only one parameter.": {
            category: DiagnosticCategory.Error,
            code: 1049
        },
        "'set' accessor parameter cannot have accessibility modifier.": {
            category: DiagnosticCategory.Error,
            code: 1050
        },
        "'set' accessor parameter cannot be optional.": {
            category: DiagnosticCategory.Error,
            code: 1051
        },
        "'set' accessor parameter cannot have initializer.": {
            category: DiagnosticCategory.Error,
            code: 1052
        },
        "'set' accessor cannot have rest parameter.": {
            category: DiagnosticCategory.Error,
            code: 1053
        },
        "'get' accessor cannot have parameters.": {
            category: DiagnosticCategory.Error,
            code: 1054
        },
        "Modifiers cannot appear here.": {
            category: DiagnosticCategory.Error,
            code: 1055
        },
        "Accessors are only when targeting EcmaScript5 and higher.": {
            category: DiagnosticCategory.Error,
            code: 1056
        },
        "Class name cannot be '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 1057
        },
        "Interface name cannot be '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 1058
        },
        "Enum name cannot be '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 1059
        },
        "Module name cannot be '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 1060
        },


        // Semantic diagnostics.
        "Duplicate identifier '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2000
        },
        "The name '{0}' does not exist in the current scope.": {
            category: DiagnosticCategory.Warning,
            code: 2001
        },
        "The name '{0}' does not refer to a value.": {
            category: DiagnosticCategory.Warning,
            code: 2002
        },
        "Keyword 'super' can only be used inside a class instance method.": {
            category: DiagnosticCategory.Warning,
            code: 2003
        },
        "The left-hand side of an assignment expression must be a variable, property or indexer.": {
            category: DiagnosticCategory.Warning,
            code: 2004
        },
        "Value of type '{0}' is not callable. Did you mean to include 'new'?": {
            category: DiagnosticCategory.Warning,
            code: 2161
        },
        "Value of type '{0}' is not callable.": {
            category: DiagnosticCategory.Warning,
            code: 2006
        },
        "Value of type '{0}' is not newable.": {
            category: DiagnosticCategory.Warning,
            code: 2007
        },
        "Value of type '{0}' is not indexable by type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2008
        },
        "Operator '{0}' cannot be applied to types '{1}' and '{2}'.": {
            category: DiagnosticCategory.Warning,
            code: 2009
        },
        "Operator '{0}' cannot be applied to types '{1}' and '{2}': {3}": {
            category: DiagnosticCategory.Warning,
            code: 2010
        },
        "Cannot convert '{0}' to '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2011
        },
        "Cannot convert '{0}' to '{1}':{NL}{2}": {
            category: DiagnosticCategory.Warning,
            code: 2012
        },
        "Expected var, class, interface, or module.": {
            category: DiagnosticCategory.Warning,
            code: 2013
        },
        "Operator '{0}' cannot be applied to type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2014
        },
        "Getter '{0}' already declared.": {
            category: DiagnosticCategory.Warning,
            code: 2015
        },
        "Setter '{0}' already declared.": {
            category: DiagnosticCategory.Warning,
            code: 2016
        },
        "Accessors cannot have type parameters.": {
            category: DiagnosticCategory.Warning,
            code: 2017
        },
        "Exported class '{0}' extends private class '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2018
        },
        "Exported class '{0}' implements private interface '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2019
        },
        "Exported interface '{0}' extends private interface '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2020
        },
        "Exported class '{0}' extends class from inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2021
        },
        "Exported class '{0}' implements interface from inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2022
        },
        "Exported interface '{0}' extends interface from inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2023
        },
        "Public static property '{0}' of exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2024
        },
        "Public property '{0}' of exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2025
        },
        "Property '{0}' of exported interface has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2026
        },
        "Exported variable '{0}' has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2027
        },
        "Public static property '{0}' of exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2028
        },
        "Public property '{0}' of exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2029
        },
        "Property '{0}' of exported interface is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2030
        },
        "Exported variable '{0}' is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2031
        },
        "Parameter '{0}' of constructor from exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2032
        },
        "Parameter '{0}' of public static property setter from exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2033
        },
        "Parameter '{0}' of public property setter from exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2034
        },
        "Parameter '{0}' of constructor signature from exported interface has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2035
        },
        "Parameter '{0}' of call signature from exported interface has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2036
        },
        "Parameter '{0}' of public static method from exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2037
        },
        "Parameter '{0}' of public method from exported class has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2038
        },
        "Parameter '{0}' of method from exported interface has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2039
        },
        "Parameter '{0}' of exported function has or is using private type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2040
        },
        "Parameter '{0}' of constructor from exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2041
        },
        "Parameter '{0}' of public static property setter from exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2042
        },
        "Parameter '{0}' of public property setter from exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2043
        },
        "Parameter '{0}' of constructor signature from exported interface is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2044
        },
        "Parameter '{0}' of call signature from exported interface is using inaccessible module {1}": {
            category: DiagnosticCategory.Warning,
            code: 2045
        },
        "Parameter '{0}' of public static method from exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2046
        },
        "Parameter '{0}' of public method from exported class is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2047
        },
        "Parameter '{0}' of method from exported interface is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2048
        },
        "Parameter '{0}' of exported function is using inaccessible module {1}.": {
            category: DiagnosticCategory.Warning,
            code: 2049
        },
        "Return type of public static property getter from exported class has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2050
        },
        "Return type of public property getter from exported class has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2051
        },
        "Return type of constructor signature from exported interface has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2052
        },
        "Return type of call signature from exported interface has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2053
        },
        "Return type of index signature from exported interface has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2054
        },
        "Return type of public static method from exported class has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2055
        },
        "Return type of public method from exported class has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2056
        },
        "Return type of method from exported interface has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2057
        },
        "Return type of exported function has or is using private type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2058
        },
        "Return type of public static property getter from exported class is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2059
        },
        "Return type of public property getter from exported class is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2060
        },
        "Return type of constructor signature from exported interface is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2061
        },
        "Return type of call signature from exported interface is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2062
        },
        "Return type of index signature from exported interface is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2063
        },
        "Return type of public static method from exported class is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2064
        },
        "Return type of public method from exported class is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2065
        },
        "Return type of method from exported interface is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2066
        },
        "Return type of exported function is using inaccessible module {0}.": {
            category: DiagnosticCategory.Warning,
            code: 2067
        },
        "'new T[]' cannot be used to create an array. Use 'new Array<T>()' instead.": {
            category: DiagnosticCategory.Warning,
            code: 2068
        },
        "A parameter list must follow a generic type argument list. '(' expected.": {
            category: DiagnosticCategory.Warning,
            code: 2069
        },
        "Multiple constructor implementations are not allowed.": {
            category: DiagnosticCategory.Warning,
            code: 2070
        },
        "Unable to resolve external module '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2071
        },
        "Module cannot be aliased to a non-module type.": {
            category: DiagnosticCategory.Warning,
            code: 2072
        },
        "A class may only extend another class.": {
            category: DiagnosticCategory.Warning,
            code: 2073
        },
        "A class may only implement another class or interface.": {
            category: DiagnosticCategory.Warning,
            code: 2074
        },
        "An interface may only extend another class or interface.": {
            category: DiagnosticCategory.Warning,
            code: 2075
        },
        "An interface cannot implement another type.": {
            category: DiagnosticCategory.Warning,
            code: 2076
        },
        "Unable to resolve type.": {
            category: DiagnosticCategory.Warning,
            code: 2077
        },
        "Unable to resolve type of '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2078
        },
        "Unable to resolve type parameter constraint.": {
            category: DiagnosticCategory.Warning,
            code: 2079
        },
        "Type parameter constraint cannot be a primitive type.": {
            category: DiagnosticCategory.Warning,
            code: 2080
        },
        "Supplied parameters do not match any signature of call target.": {
            category: DiagnosticCategory.Warning,
            code: 2081
        },
        "Supplied parameters do not match any signature of call target:{NL}{0}": {
            category: DiagnosticCategory.Warning,
            code: 2082
        },
        "Invalid 'new' expression.": {
            category: DiagnosticCategory.Warning,
            code: 2083
        },
        "Call sigantures used in a 'new' expression must have a 'void' return type.": {
            category: DiagnosticCategory.Warning,
            code: 2084
        },
        "Could not select overload for 'new' expression.": {
            category: DiagnosticCategory.Warning,
            code: 2085
        },
        "Type '{0}' does not satisfy the constraint '{1}' for type parameter '{2}'.": {
            category: DiagnosticCategory.Warning,
            code: 2086
        },
        "Could not select overload for 'call' expression.": {
            category: DiagnosticCategory.Warning,
            code: 2087
        },
        "Unable to invoke type with no call signatures.": {
            category: DiagnosticCategory.Warning,
            code: 2088
        },
        "Calls to 'super' are only valid inside a class.": {
            category: DiagnosticCategory.Warning,
            code: 2089
        },
        "Generic type '{0}' requires {1} type argument(s).": {
            category: DiagnosticCategory.Warning,
            code: 2090
        },
        "Type of conditional expression cannot be determined. Best common type could not be found between '{0}' and '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2091
        },
        "Type of array literal cannot be determined. Best common type could not be found for array elements.": {
            category: DiagnosticCategory.Warning,
            code: 2092
        },
        "Could not find enclosing symbol for dotted name '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2093
        },
        "The property '{0}' does not exist on value of type '{1}'.": {
            category: DiagnosticCategory.Warning,
            code: 2094
        },
        "Could not find symbol '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2095
        },
        "'get' and 'set' accessor must have the same type.": {
            category: DiagnosticCategory.Warning,
            code: 2096
        },
        "'this' cannot be referenced in current location.": {
            category: DiagnosticCategory.Warning,
            code: 2097
        },
        "Use of deprecated type 'bool'. Use 'boolean' instead.": {
            category: DiagnosticCategory.Warning,
            code: 2098
        },
        "Static methods cannot reference class type parameters.": {
            category: DiagnosticCategory.Warning,
            code: 2099
        },
        "Class '{0}' is recursively referenced as a base type of itself.": {
            category: DiagnosticCategory.Warning,
            code: 2100
        },
        "Interface '{0}' is recursively referenced as a base type of itself.": {
            category: DiagnosticCategory.Warning,
            code: 2101
        },
        "'super' property access is permitted only in a constructor, instance member function, or instance member accessor of a derived class.": {
            category: DiagnosticCategory.Warning,
            code: 2102
        },
        "'super' cannot be referenced in non-derived classes.": {
            category: DiagnosticCategory.Warning,
            code: 2103
        },
        "A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.": {
            category: DiagnosticCategory.Warning,
            code: 2104
        },
        "Constructors for derived classes must contain a 'super' call.": {
            category: DiagnosticCategory.Warning,
            code: 2105
        },
        "Super calls are not permitted outside constructors or in local functions inside constructors.": {
            category: DiagnosticCategory.Warning,
            code: 2106
        },
        "'{0}.{1}' is inaccessible.": {
            category: DiagnosticCategory.Warning,
            code: 2107
        },
        "'this' cannot be referenced within module bodies.": {
            category: DiagnosticCategory.Warning,
            code: 2108
        },
        "'this' must only be used inside a function or script context.": {
            category: DiagnosticCategory.Warning,
            code: 2109
        },
        "Invalid '+' expression - types not known to support the addition operator.": {
            category: DiagnosticCategory.Warning,
            code: 2111
        },
        "The right-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.": {
            category: DiagnosticCategory.Warning,
            code: 2112
        },
        "The left-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.": {
            category: DiagnosticCategory.Warning,
            code: 2113
        },
        "The type of a unary arithmetic operation operand must be of type 'any', 'number' or an enum type.": {
            category: DiagnosticCategory.Warning,
            code: 2114
        },
        "Variable declarations for for/in expressions cannot contain a type annotation.": {
            category: DiagnosticCategory.Warning,
            code: 2115
        },
        "Variable declarations for for/in expressions must be of types 'string' or 'any'.": {
            category: DiagnosticCategory.Warning,
            code: 2116
        },
        "The right operand of a for/in expression must be of type 'any', an object type or a type parameter.": {
            category: DiagnosticCategory.Warning,
            code: 2117
        },
        "The left-hand side of an 'in' expression must be of types 'string' or 'any'.": {
            category: DiagnosticCategory.Warning,
            code: 2118
        },
        "The right-hand side of an 'in' expression must be of type 'any', an object type or a type parameter.": {
            category: DiagnosticCategory.Warning,
            code: 2119
        },
        "The left-hand side of an 'instanceOf' expression must be of type 'any', an object type or a type parameter.": {
            category: DiagnosticCategory.Warning,
            code: 2120
        },
        "The right-hand side of an 'instanceOf' expression must be of type 'any' or a subtype of the 'Function' interface type.": {
            category: DiagnosticCategory.Warning,
            code: 2121
        },
        "Setters cannot return a value.": {
            category: DiagnosticCategory.Warning,
            code: 2122
        },
        "Tried to set variable type to uninitialized module type.": {
            category: DiagnosticCategory.Warning,
            code: 2123
        },
        "Tried to set variable type to uninitialized module type '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2124
        },
        "Function {0} declared a non-void return type, but has no return expression.": {
            category: DiagnosticCategory.Warning,
            code: 2125
        },
        "Getters must return a value.": {
            category: DiagnosticCategory.Warning,
            code: 2126
        },
        "Getter and setter accessors do not agree in visibility.": {
            category: DiagnosticCategory.Warning,
            code: 2127
        },
        "Invalid left-hand side of assignment expression.": {
            category: DiagnosticCategory.Warning,
            code: 2130
        },
        "Function declared a non-void return type, but has no return expression.": {
            category: DiagnosticCategory.Warning,
            code: 2131
        },
        "Cannot resolve return type reference.": {
            category: DiagnosticCategory.Warning,
            code: 2132
        },
        "Constructors cannot have a return type of 'void'.": {
            category: DiagnosticCategory.Warning,
            code: 2133
        },
        "Subsequent variable declarations must have the same type.  Variable '{0}' must be of type '{1}', but here has type '{2}'": {
            category: DiagnosticCategory.Warning,
            code: 2134
        },
        "All symbols within a with block will be resolved to 'any'.": {
            category: DiagnosticCategory.Warning,
            code: 2135
        },
        "Import declarations in an internal module cannot reference an external module.": {
            category: DiagnosticCategory.Warning,
            code: 2136
        },
        "Class {0} declares interface {1} but does not implement it:{NL}{2}": {
            category: DiagnosticCategory.Warning,
            code: 2137
        },
        "Class {0} declares class {1} as an implemented interface but does not implement it:{NL}{2}": {
            category: DiagnosticCategory.Warning,
            code: 2138
        },
        "The operand of an increment or decrement operator must be a variable, property or indexer.": {
            category: DiagnosticCategory.Warning,
            code: 2139
        },
        "'this' cannot be referenced in initializers in a class body.": {
            category: DiagnosticCategory.Warning,
            code: 2140
        },
        "Class '{0}' cannot extend class '{1}':{NL}{2}": {
            category: DiagnosticCategory.Warning,
            code: 2141
        },
        "Interface '{0}' cannot extend class '{1}':{NL}{2}": {
            category: DiagnosticCategory.Warning,
            code: 2142
        },
        "Interface '{0}' cannot extend interface '{1}':{NL}{2}": {
            category: DiagnosticCategory.Warning,
            code: 2143
        },
        "Duplicate overload signature for '{0}'.": {
            category: DiagnosticCategory.Warning,
            code: 2144
        },
        "Duplicate constructor overload signature.": {
            category: DiagnosticCategory.Warning,
            code: 2145
        },
        "Duplicate overload call signature.": {
            category: DiagnosticCategory.Warning,
            code: 2146
        },
        "Duplicate overload construct signature.": {
            category: DiagnosticCategory.Warning,
            code: 2147
        },
        "Overload signature is not compatible with function definition.": {
            category: DiagnosticCategory.Warning,
            code: 2148
        },
        "Overload signature is not compatible with function definition:{NL}{0}": {
            category: DiagnosticCategory.Warning,
            code: 2149
        },
        "Overload signatures must all be public or private.": {
            category: DiagnosticCategory.Warning,
            code: 2150
        },
        "Overload signatures must all be exported or local.": {
            category: DiagnosticCategory.Warning,
            code: 2151
        },
        "Overload signatures must all be ambient or non-ambient.": {
            category: DiagnosticCategory.Warning,
            code: 2152
        },
        "Overload signatures must all be optional or required.": {
            category: DiagnosticCategory.Warning,
            code: 2153
        },
        "Specialized overload signature is not subtype of any non-specialized signature.": {
            category: DiagnosticCategory.Warning,
            code: 2154
        },
        "'this' cannot be referenced in constructor arguments.": {
            category: DiagnosticCategory.Warning,
            code: 2155
        },
        "Static member cannot be accessed off an instance variable.": {
            category: DiagnosticCategory.Warning,
            code: 2156
        },
        "Instance member cannot be accessed off a class.": {
            category: DiagnosticCategory.Warning,
            code: 2157
        },
        "Untyped function calls may not accept type arguments.": {
            category: DiagnosticCategory.Warning,
            code: 2158
        },
        "Non-generic functions may not accept type arguments.": {
            category: DiagnosticCategory.Warning,
            code: 2159
        },
        "A generic type may not reference itself with its own type parameters.": {
            category: DiagnosticCategory.Warning,
            code: 2160
        },
        "Rest parameters must be array types.": {
            category: DiagnosticCategory.Warning,
            code: 2162
        },
        "Overload signature implementation cannot use specialized type.": {
            category: DiagnosticCategory.Warning,
            code: 2163
        },
        "Type '{0}' is missing property '{1}' from type '{2}'.": {
            category: DiagnosticCategory.Message,
            code: 4000
        },
        "Types of property '{0}' of types '{1}' and '{2}' are incompatible.": {
            category: DiagnosticCategory.Message,
            code: 4001
        },
        "Types of property '{0}' of types '{1}' and '{2}' are incompatible:{NL}{3}": {
            category: DiagnosticCategory.Message,
            code: 4002
        },
        "Property '{0}' defined as private in type '{1}' is defined as public in type '{2}'.": {
            category: DiagnosticCategory.Message,
            code: 4003
        },
        "Property '{0}' defined as public in type '{1}' is defined as private in type '{2}'.": {
            category: DiagnosticCategory.Message,
            code: 4004
        },
        "Types '{0}' and '{1}' define property '{2}' as private.": {
            category: DiagnosticCategory.Message,
            code: 4005
        },
        "Call signatures of types '{0}' and '{1}' are incompatible.": {
            category: DiagnosticCategory.Message,
            code: 4006
        },
        "Call signatures of types '{0}' and '{1}' are incompatible:{NL}{2}": {
            category: DiagnosticCategory.Message,
            code: 4007
        },
        "Type '{0}' requires a call signature, but type '{1}' lacks one.": {
            category: DiagnosticCategory.Message,
            code: 4008
        },
        "Construct signatures of types '{0}' and '{1}' are incompatible.": {
            category: DiagnosticCategory.Message,
            code: 4009
        },
        "Construct signatures of types '{0}' and '{1}' are incompatible:{NL}{2}": {
            category: DiagnosticCategory.Message,
            code: 40010
        },
        "Type '{0}' requires a construct signature, but type '{1}' lacks one.": {
            category: DiagnosticCategory.Message,
            code: 4011
        },
        "Index signatures of types '{0}' and '{1}' are incompatible.": {
            category: DiagnosticCategory.Message,
            code: 4012
        },
        "Index signatures of types '{0}' and '{1}' are incompatible:{NL}{2}": {
            category: DiagnosticCategory.Message,
            code: 4013
        },
        "Call signature expects {0} or fewer parameters.": {
            category: DiagnosticCategory.Message,
            code: 4014
        },
        "Could not apply type'{0}' to argument {1} which is of type '{2}'.": {
            category: DiagnosticCategory.Message,
            code: 4015
        },
        "Class '{0}' defines instance member accessor '{1}', but extended class '{2}' defines it as instance member function.": {
            category: DiagnosticCategory.Message,
            code: 4016
        },
        "Class '{0}' defines instance member property '{1}', but extended class '{2}' defines it as instance member function.": {
            category: DiagnosticCategory.Message,
            code: 4017
        },
        "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member accessor.": {
            category: DiagnosticCategory.Message,
            code: 4018
        },
        "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member property.": {
            category: DiagnosticCategory.Message,
            code: 4019
        },
        "Types of static property '{0}' of class '{1}' and class '{2}' are incompatible.": {
            category: DiagnosticCategory.Message,
            code: 4020
        },
        "Types of static property '{0}' of class '{1}' and class '{2}' are incompatible:{NL}{3}": {
            category: DiagnosticCategory.Message,
            code: 4021
        },


        // TypeScript compiler diagnostics.
        "Current host does not support -w[atch] option.": {
            category: DiagnosticCategory.Error,
            code: 5001
        },
        "ECMAScript target version '{0}' not supported.  Using default '{1}' code generation.": {
            category: DiagnosticCategory.Warning,
            code: 5002
        },
        "Module code generation '{0}' not supported.  Using default '{1}' code generation.": {
            category: DiagnosticCategory.Warning,
            code: 5003
        },
        "Could not find file: '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 5004
        },
        "Unknown extension for file: '{0}'. Only .ts and .d.ts extensions are allowed.": {
            category: DiagnosticCategory.Error,
            code: 5005
        },
        "A file cannot reference itself.": {
            category: DiagnosticCategory.Error,
            code: 5006
        },
        "Cannot resolve referenced file: '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 5007
        },
        "Cannot resolve imported file: '{0}'.": {
            category: DiagnosticCategory.Error,
            code: 5008
        },
        "Cannot find the common subdirectory path for the input files": {
            category: DiagnosticCategory.Error,
            code: 5009
        },
        "Cannot compile dynamic modules when emitting into single file": {
            category: DiagnosticCategory.Error,
            code: 5010
        },

        // Emitter diagnostics
        "Emit Error: {0}.": {
            category: DiagnosticCategory.Error,
            code: 6000
        }
    };

    export var LocalizedDiagnosticMessages: any = null;
}