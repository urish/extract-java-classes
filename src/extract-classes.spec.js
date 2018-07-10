const { extractClasses, stripMethodBodies } = require('./extract-classes');

describe('extractClasses', () => {
  it('should extract the classes from the input file', () => {
    expect(extractClasses('package test;\nclass Foo { String a; Number b; } ')).toEqual([
      'class Foo { String a; Number b; }',
    ]);
  });

  it('should extract multiple classes', () => {
    expect(extractClasses('  class Foo { String a; Number b; } \n class Bar { } ')).toEqual([
      'class Foo { String a; Number b; }',
      'class Bar { }',
    ]);
  });
});

describe('stripMethodBodies', () => {
  it('should strip the bodies of all the methods in the class', () => {
    const input = `
      class Foo { 
        public void bar () { 
          System.out.println("bar"); 
        } 

        public void baz() { 
          System.out.println("baz"); 
        } 
      }
    `;

    const expected = `
      class Foo { 
        public void bar (); 

        public void baz(); 
      }
    `.trim();
    expect(stripMethodBodies(input)).toContain(expected);
  });

  it('should remove the constructor', () => {
    const input = `
        class Foo { 
          public Foo () {
            System.out.println("Foo"); 
          }
        }
      `;

    const expected = `
        class Foo { 
          
        }
      `.trim();
    expect(stripMethodBodies(input)).toContain(expected);
  });
});
