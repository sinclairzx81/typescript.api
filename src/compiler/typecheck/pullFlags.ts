// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\typescript.ts' />

module TypeScript {

    export enum PullElementFlags {
        None = 0,
        Exported = 1,
        Private = 1 << 1,
        Public = 1 << 2,
        Ambient = 1 << 3,
        Static = 1 << 4,
        GetAccessor = 1 << 5,
        SetAccessor = 1 << 6,
        Optional = 1 << 7,
        Call = 1 << 8,
        Constructor = 1 << 9,
        Index = 1 << 10,
        Signature = 1 << 11,
        Enum = 1 << 12,
        FatArrow = 1 << 13,

        ClassConstructorVariable = 1 << 14,
        InitializedModule = 1 << 15,
        InitializedDynamicModule = 1 << 16,

        MustCaptureThis = 1 << 17,
        Constant = 1 << 18,

        ExpressionElement = 1 << 19,

        DeclaredInAWithBlock = 1 << 20,

        ImplicitVariable = ClassConstructorVariable | InitializedModule | InitializedDynamicModule,
        SomeInitializedModule = InitializedModule | InitializedDynamicModule,
    }

    export enum PullElementKind {
        None = 0,

        Script = 1,
        Global = 1 << 1,
        Primitive = 1 << 2,

        Container = 1 << 3,
        Class = 1 << 4,
        Interface = 1 << 5,
        DynamicModule = 1 << 6,
        Enum = 1 << 7,
        Array = 1 << 8,
        TypeAlias = 1 << 9,
        ObjectLiteral = 1 << 10,

        Variable = 1 << 11,
        Parameter = 1 << 12,
        Property = 1 << 13,
        TypeParameter = 1 << 14,

        Function = 1 << 15,
        ConstructorMethod = 1 << 16,
        Method = 1 << 17,
        FunctionExpression = 1 << 18,

        GetAccessor = 1 << 19,
        SetAccessor = 1 << 20,

        CallSignature = 1 << 21,
        ConstructSignature = 1 << 22,
        IndexSignature = 1 << 23,

        ObjectType = 1 << 24,
        FunctionType = 1 << 25,
        ConstructorType = 1 << 26,

        EnumMember = 1 << 27,
        ErrorType = 1 << 28,

        Expression = 1 << 29,

        WithBlock = 1 << 30,
        CatchBlock = 1 << 31,

        All = Script | Global | Primitive | Container | Class | Interface | DynamicModule | Enum | Array | TypeAlias |
            ObjectLiteral | Variable | Parameter | Property | TypeParameter | Function | ConstructorMethod | Method |
            FunctionExpression | GetAccessor | SetAccessor | CallSignature | ConstructSignature | IndexSignature | ObjectType |
            FunctionType | ConstructorType | EnumMember | ErrorType | Expression | WithBlock | CatchBlock,

        SomeFunction = Function | ConstructorMethod | Method | FunctionExpression | GetAccessor | SetAccessor | CallSignature | ConstructSignature | IndexSignature,

        // Warning: SomeValue and SomeType (along with their constituents) must be disjoint
        SomeValue = Variable | Parameter | Property | EnumMember | SomeFunction,

        SomeType = Script | Global | Primitive | Container | Class | Interface | DynamicModule |
                    Enum | Array | TypeAlias | ObjectType | FunctionType | ConstructorType | TypeParameter | ErrorType,

        SomeContainer = Container | DynamicModule | TypeAlias,

        SomeBlock = WithBlock | CatchBlock,

        SomeSignature = CallSignature | ConstructSignature | IndexSignature,

        SomeAccessor = GetAccessor | SetAccessor,

        SomeLHS = Variable | Property | Parameter | SetAccessor | Method,
    }

    export enum SymbolLinkKind {
        TypedAs,
        ContextuallyTypedAs,
        ProvidesInferredType,
        ArrayType,

        ArrayOf,

        PublicMember,
        PrivateMember,

        ConstructorMethod,

        Aliases,

        ContainedBy,

        Extends,
        Implements,

        Parameter,
        ReturnType,

        CallSignature,
        ConstructSignature,
        IndexSignature,

        TypeParameter,
        TypeArgument,
        TypeParameterSpecializedTo,
        SpecializedTo,

        TypeConstraint,

        ContributesToExpression,

        GetterFunction,
        SetterFunction,
    }
}