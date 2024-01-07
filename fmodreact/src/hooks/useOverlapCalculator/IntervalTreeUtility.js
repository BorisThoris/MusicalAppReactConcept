export const insertGroupsIntoTree = (groups, tree, eventSet) => {
    groups.forEach((group) => {
        tree.insert([group.startTime, group.endTime], group);
        group.events.forEach((event) => eventSet.add(event));
    });
};

export const findOverlappingGroups = (event, tree) =>
    tree.search([event.startTime, event.endTime]);
