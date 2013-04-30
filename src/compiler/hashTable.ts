//﻿
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

///<reference path='typescript.ts' />

module TypeScript {
    export class BlockIntrinsics {
        public prototype = undefined;
        public toString = undefined;
        public toLocaleString = undefined;
        public valueOf = undefined;
        public hasOwnProperty = undefined;
        public propertyIsEnumerable = undefined;
        public isPrototypeOf = undefined;

        constructor () {
            // initialize the 'constructor' field
            this["constructor"] = undefined;
        }
    }

    export interface IHashTable {
        getAllKeys(): string[];
        add(key: string, data): boolean;
        addOrUpdate(key: string, data): boolean;
        map(fn: (k: string, value: any, context: any) => void , context: any): void;
        every(fn: (k: string, value: any, context: any) => void , context: any): boolean;
        some(fn: (k: string, value: any, context: any) => void , context: any): boolean;
        count(): number;
        lookup(key: string): any;
    }

    export class StringHashTable implements IHashTable {
        public itemCount = 0;
        public table: any = new BlockIntrinsics();

        public getAllKeys(): string[] {
            var result: string[] = [];

            for (var k in this.table) {
                if (this.table[k] !== undefined) {
                    result.push(k);
                }
            }

            return result;
        }

        public add(key: string, data): boolean {
            if (this.table[key] !== undefined) {
                return false;
            }

            this.table[key] = data;
            this.itemCount++;
            return true;
        }

        public addOrUpdate(key: string, data): boolean {
            if (this.table[key] !== undefined) {
                this.table[key] = data;
                return false;
            }

            this.table[key] = data;
            this.itemCount++;
            return true;
        }

        public map(fn: (k: string, value: any, context: any) => void , context: any) {
            for (var k in this.table) {
                var data = this.table[k];

                if (data !== undefined) {
                    fn(k, this.table[k], context);
                }
            }
        }

        public every(fn: (k: string, value: any, context: any) => void , context: any) {
            for (var k in this.table) {
                var data = this.table[k];

                if (data !== undefined) {
                    if (!fn(k, this.table[k], context)) {
                        return false;
                    }
                }
            }

            return true;
        }

        public some(fn: (k: string, value: any, context: any) => void , context: any) {
            for (var k in this.table) {
                var data = this.table[k];

                if (data !== undefined) {
                    if (fn(k, this.table[k], context)) {
                        return true;
                    }
                }
            }

            return false;
        }

        public count(): number {
            return this.itemCount;
        }

        public lookup(key: string) {
            var data = this.table[key];
            return data === undefined ? null : data;
        }
    }
}