module.exports = function ({
    isStr,
    isArr,
    isDef,
    isFunc,
}) {
    return class Registry {
        constructor()
        {
            this.PRIVATE_SUBJECTS = {};
            this.PUBLIC_SUBJECTS  = {};
        }
    
        public(identifier, fn)
        {
            identifier = this._processIdentifier(identifier);
           
            if (isArr(identifier)) {
                let [subject, action] = identifier;
                if (!isDef(this.PUBLIC_SUBJECTS[subject])){
                    this.PUBLIC_SUBJECTS[subject] = {};
                }
                this.PUBLIC_SUBJECTS[subject][action] = fn;
            }
        }
    
        private(identifier, fn)
        {
            identifier = this._processIdentifier(identifier);

            if (isArr(identifier)) {
                let [subject, action] = identifier;
                if (!isDef(this.PRIVATE_SUBJECTS[subject])){
                    this.PRIVATE_SUBJECTS[subject] = {};
                }
                
                this.PRIVATE_SUBJECTS[subject][action] = fn;
            }
        }

        _processIdentifier(identifier)
        {
            if(isStr(identifier)) {
                identifier = String(identifier).split('.');
            }
            return identifier;
        }
    
        getAllPublic()
        {
            return this.PUBLIC_SUBJECTS;
        }
    
        getAllPrivate()
        {
            return this.PRIVATE_SUBJECTS;
        }

        execute(identifier, props)
        {
            identifier = this._processIdentifier(identifier);
            let [subject, action] = identifier;
            let fn;
            
            fn = this.PUBLIC_SUBJECTS[subject][action];
            if (!isFunc(fn)) {
                fn = this.PRIVATE_SUBJECTS[subject][action];
            }

            if (isFunc(fn)) {
                return fn(props);
            }
            
            return null;
        }
    }
}