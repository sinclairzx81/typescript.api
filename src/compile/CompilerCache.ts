// Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
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

/// <reference path="../decl/typescript.d.ts" />
/// <reference path="../units/SourceUnit.ts" />

module TypeScript.Api {

    export class CompilerCache {

        public units    : TypeScript.Api.SourceUnit[];

        constructor(public compiler : TypeScript.TypeScriptCompiler) {

            this.units   = [];
        }

        // fetches a cached used from its path name.
        // it does this by checking the units path
        // against the incoming parameter.
		public get_cached_unit(path:string) : TypeScript.Api.SourceUnit
		{
			for(var i = 0; i < this.units.length; i++)
			{
				if(this.units[i].path === path)
				{
					return this.units[i];
				}
			}
			return null;
		}

        // checks to see if this unit is in cache. 
        // it does this by checking the units path
        // against the incoming parameter.
        public is_in_cache(path:string) : boolean {
			
            for(var i = 0; i < this.units.length; i++)
			{
				if(this.units[i].path === path)
				{
					return true;
				}
			}
			return false;
            
        }

        // checks to see if the unit has changed in anyway.
        // it does this by first comparing the length, then
        // the content of the unit.
        private compare (a: TypeScript.Api.SourceUnit, b:TypeScript.Api.SourceUnit) : boolean {

            if(a.content.length === b.content.length) {

			    if(a.content === b.content) {

				    return true;
			    }
            }

			return false;
        }

        // phase 1) scans over these source units, making decisions
        // about what is new, what needs updating, and what
        // needs removing from the cache. This method also
        // talks to the compiler, informing it of changes also.
        public refresh (units:TypeScript.Api.SourceUnit[]) : void {

            for(var i = 0; i < units.length; i++) {

                // note: only refesh units without 
                // resolution errors. 

                if(units[i].diagnostics.length == 0) {

                    if(! this.is_in_cache(units[i].path)) {

                        var new_unit = units[i];

                         var snapshot  = TypeScript.ScriptSnapshot.fromString( new_unit.content );

                        // push to compiler..

				        var references = TypeScript.getReferencedFiles(new_unit.path, snapshot);

                        this.compiler.addSourceUnit( new_unit.path, snapshot, 1 /*ByteOrderMark.Utf8*/, 0, false, references); 

                        // update new unit type check phase.

                        new_unit.syntaxChecked = false;

                        new_unit.typeChecked   = false;

                        this.units.push(new_unit);
                    }
                    else {

                        var cached_unit = this.get_cached_unit(units[i].path);

                        var snapshot  = TypeScript.ScriptSnapshot.fromString( cached_unit.content );

                        if(this.compare(units[i], cached_unit) == false) { // a change.

                            var updated_unit = units[i];

                            var textSpan   = new TypeScript.TextSpan(0, cached_unit.content.length);

                            var textChange = new TypeScript.TextChangeRange(textSpan, updated_unit.content.length );

				            this.compiler.updateSourceUnit( updated_unit.path, snapshot, 0, false, textChange); 

                            // update cached unit type checked phase.

                            cached_unit.syntaxChecked = false;

                            cached_unit.typeChecked   = false;
                    
                            cached_unit.path          = updated_unit.path;

                            cached_unit.content       = updated_unit.content;

                            cached_unit.diagnostics   = updated_unit.diagnostics;

                            cached_unit.remote        = updated_unit.remote;
                        }
                    }
                }               
            }

            // remove any units from the cache which are no longer
            // being referenced.
            this.units = this.units.filter((unit) => {

                for(var i = 0; i < units.length; i++) {

                    if(units[i].path === unit.path) {

                        return true;
                    }
                }

                return false;
            });            
        }

        // runs a syntax check on this unit.
		private syntaxCheck (unit:TypeScript.Api.SourceUnit) : TypeScript.Api.Diagnostic [] {

			var diagnostics : TypeScript.Api.Diagnostic[] = [];

			var _diagnostics = this.compiler.getSyntacticDiagnostics(unit.path);

			for(var i = 0; i < _diagnostics.length; i++)
			{
				var diagnostic = new TypeScript.Api.Diagnostic("syntax", _diagnostics[i].fileName(), _diagnostics[i].text(), _diagnostics[i].message());

				diagnostic.computeLineInfo(unit.content, _diagnostics[i].start());

				diagnostics.push( diagnostic );
			}
            
			return diagnostics;
		}

        // runs a type check on this unit.
		private typeCheck(unit:TypeScript.Api.SourceUnit) : TypeScript.Api.Diagnostic [] {

            var diagnostics : TypeScript.Api.Diagnostic[] = [];

			this.compiler.pullTypeCheck();
            
			var _diagnostics = this.compiler.getSemanticDiagnostics(unit.path);

			for(var i = 0; i < _diagnostics.length; i++)
			{
				var diagnostic = new TypeScript.Api.Diagnostic("typecheck", _diagnostics[i].fileName(), _diagnostics[i].text(), _diagnostics[i].message());
                
				diagnostic.computeLineInfo(unit.content, _diagnostics[i].start());

				diagnostics.push( diagnostic );
			}

			return diagnostics;
		}

        // phase 2) type and syntax checking.
        // scan over the units and look for type
        // and syntax checked flags. if they are
        // false, we need to have the compiler deal 
        // with them.
        private type_and_syntax_checking() : void {
            
			// syntax check....

			for(var i = 0; i < this.units.length; i++) {

                if(!this.units[i].syntaxChecked)
                {
				    var diagnostics = this.syntaxCheck( this.units[i] );

                    for(var j = 0; j < diagnostics.length; j++) {

                        this.units[i].diagnostics.push( diagnostics[j] );
                    }

                    this.units[i].syntaxChecked = true;
                }
			}

			// type check....

			for(var i = 0; i < this.units.length; i++) {

                if(!this.units[i].typeChecked) {

				    var diagnostics = this.typeCheck( this.units[i] );

				    for(var j = 0; j < diagnostics.length; j++) {

					    this.units[i].diagnostics.push( diagnostics[j] );
				    }

                    this.units[i].typeChecked = true;
                }
			}        
        }


        // refreshes the cache. accepts a set of source units
        // and refreshes this instances inner cache. 
        public update (units:TypeScript.Api.SourceUnit[]): void  {

            this.refresh(units);

            this.type_and_syntax_checking();
        }


        // makes a change to all referenced files, forcing
        // the cache to detech these units as requiring 
        // an update.
        public reevaluate_references(): void {
            
            // reevaluate all units except the first.
            for(var i = 0; i < this.units.length - 1; i++) {

                this.units[i].content = this.units[i].content + ' ';
            }
        }
     }
}