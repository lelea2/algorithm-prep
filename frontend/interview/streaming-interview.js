Streaming

/*
You have been tasked with parsing menus from a large restaurant group. Each menu is streamed to clients via a provided interface. You must design object(s) that represents a menu and can be instantiated with data from the provided interface. Your design should contain an appropriate class structure to contain the parsed data, as well as a function or set of functions to perform the parsing.

Consumers will use your object(s) to access a complete representation of the data sent by the menu stream after it has finished loading. Your objects should provide easy access to the full representation of the menu. It should be possible to reconstruct the menu stream from your object.

The menu stream represents a list of menu items. Each item in the stream is a menu item, and each item will be separated by an empty string. The attributes of each item are as follows:

- Line 0: The ID of the item
- Line 1: The item type, either CATEGORY, DISH or OPTION
- Line 2: The name of the item
- Line 3: The price of the item for DISH and OPTION. Not present for CATEGORY items.
- Any other line: A list of item IDs that are linked to the current item. OPTIONs do not have any linked items.

example input:
4
DISH
Spaghetti
10.95
2
3

1
CATEGORY
Pasta
4
5

2
OPTION
Meatballs
1.00

3
OPTION
Chicken
2.00

5
DISH
Lasagna
12.00

6
DISH
Caesar Salad
9.75
3
*/

const _ = require('lodash');

class MenuItem {
  constructor(id, type, name, price = null, linkedIds = []) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.price = price;
    this.linkedIds = linkedIds;
  }

  // convert item back to stream lines
  serialize() {
    const lines = [this.id, this.type, this.name];
    if (this.type !== 'CATEGORY') {
      lines.push(this.price);
    }
    lines.push(...this.linkedIds);
    return lines;
  }
}

class Menu {
  constructor() {
    this.items = new Map();
  }

  addItem(item) {
    if (this.items.has(item.id)) {
      // duplicate item
      throw new Error(`Duplicate item Id: ${item.id}`);
    }
    this.items.set(item.id, item);
  }

  getItem(id) {
    return this.items.get(id);
  }

  getLinkedItems(id) {

  }

  serialize() {
    const result = [];
    for (const item of this.items.values()) {
      result.push(...item.serialize());
      result.push("");
    }
    return result;
  }

  print() {
    // console.log('>>>> start here');
    for(const item of this.items.values()) {
      console.log(`${item.id}. ${item.type}: ${item.name} - ${item.price != null ? item.price : 'n/a'}`);
      for (const linkedId of item.linkedIds) {
        const linkedItem = this.getItem(linkedId);
        if (linkedItem) {
          console.log(`--> ${linkedItem.id}. ${linkedItem.type}: ${linkedItem.name} - ${linkedItem.price ?? 'n/a'}`);
        }
      }
    }
    // console.log('>>>> End here');
  }

  printByOrder(sortBy = 'price', order = 'asc') {
    const items = [...this.items.values()];
    items.sort((a, b) => {
      let result = 0;
      if (sortBy === 'price') {
        const priceA = a.price === null ? -Infinity : Number(a.price);
        const priceB = b.price === null ? -Infinity : Number(b.price);
        result = priceA - priceB;
        // sort by name if same price
        if (result === 0) {
          result = a.name.localeCompare(b.name);
        }
      } else {
        result = a.name.localeCompare(b.name);
      }
      return order = 'desc' ? -result : result;
    });
    for(const item of items) {
      console.log(`${item.id}. ${item.type}: ${item.name} - ${item.price != null ? item.price : 'n/a'}`);
      for (const linkedId of item.linkedIds) {
        const linkedItem = this.getItem(linkedId);
        if (linkedItem) {
          console.log(`--> ${linkedItem.id}. ${linkedItem.type}: ${linkedItem.name} - ${linkedItem.price ?? 'n/a'}`);
        }
      }
    }
  }
}

class MenuParser {
  static parseItem(lines) {
    const [id, type, name] = lines;

    if (!id || !name) {
      throw new Error("invalid menu item");
    }

    switch(type) {
      case "CATEGORY":
        return new MenuItem(
          id,
          type,
          name,
          null,
          lines.slice(3)
        );
      case "DISH":
        if (lines.length < 4) {
          throw new Error('dish missing price');
        }
        return new MenuItem(
          id,
          type,
          name,
          lines[3],
          lines.slice(4)
        );
      case "OPTION":
        if(lines.length !== 4) {
          throw new Error("invalid option");
        }
        return new MenuItem(
          id,
          type,
          name,
          lines[3],
          []
        );
      default:
        throw new Error(`Invalid type: ${type}`);
    }
  }

  static parse(stream) {
    const menu = new Menu();
    let buffer = [];

    while(true) {
      const line = stream.nextLine();
      // end of stream when line is null
      if (line === null) {
        if (buffer.length > 0) {
          menu.addItem(this.parseItem(buffer));
        }
        break;
      }

      if (line === '') {
        if (buffer.length > 0) {
          menu.addItem(this.parseItem(buffer));
          buffer = [];
        }
      } else {
        buffer.push(line);
      }
    }
    return menu;
  }
}

class MenuStream {
  constructor() {
    this.stream = [
      '4',
      'DISH',
      'Spaghetti',
      '10.95',
      '2',
      '3',
      '',
      '1',
      'CATEGORY',
      'Pasta',
      '4',
      '5',
      '',
      '2',
      'OPTION',
      'Meatballs',
      '1.00',
      '',
      '3',
      'OPTION',
      'Chicken',
      '2.00',
      '',
      '5',
      'DISH',
      'Lasagna',
      '12.00',
      '',
      '6',
      'DISH',
      'Caesar Salad',
      '9.75',
      '3',
      '',
    ];
  }

  nextLine() {
    if (this.stream.length === 0) {
      return null;
    }

    return this.stream.shift();
  }
}

const stream = new MenuStream();
const menu = MenuParser.parse(stream);
// menu.print();
menu.printByOrder('price', 'asc');

// console.log(menu.getItem("4"));
// console.log(menu.getItem("1"));
