import Konva from 'konva';

/**
 * Exported: true if two elements overlap in time AND their rects intersect,
 * and they share the same instrumentName.
 */
export const isOverlapping = (elA, elB) => {
    if (elA.instrumentName !== elB.instrumentName) {
        return false;
    }
    if (elA.endTime <= elB.startTime || elB.endTime <= elA.startTime) {
        return false;
    }
    return Konva.Util.haveIntersection(elA.rect, elB.rect);
};

/**
 * Union-Find data structure encapsulating parent & rank.
 */
class UnionFind {
    constructor(ids) {
        this.parent = Object.fromEntries(ids.map((id) => [id, id]));
        this.rank = Object.fromEntries(ids.map((id) => [id, 0]));
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    union(a, b) {
        const ra = this.find(a);
        const rb = this.find(b);
        if (ra === rb) {
            return;
        }
        if (this.rank[ra] > this.rank[rb]) {
            this.parent[rb] = ra;
        } else if (this.rank[ra] < this.rank[rb]) {
            this.parent[ra] = rb;
        } else {
            this.parent[rb] = ra;
            this.rank[ra] += 1;
        }
    }
}

/**
 * Unwrap grouped elements (if any), else return singleton array.
 */
function getAllElements(element) {
    return element.elements ? Object.values(element.elements) : [element];
}

/**
 * Build the final grouped output after all unions.
 */
function buildGroupsFromUF(elems, uf) {
    const temp = {};
    elems.forEach((el) => {
        const root = uf.find(el.id);
        if (!temp[root]) {
            temp[root] = {
                elements: {},
                ids: new Set(),
                isSelected: el.isSelected,
                locked: el.locked
            };
        }
        getAllElements(el).forEach((child) => {
            temp[root].elements[child.id] = child;
            temp[root].ids.add(child.id);
        });
    });

    const result = {};
    Object.entries(temp).forEach(([root, group]) => {
        const ids = Array.from(group.ids);
        if (ids.length === 1) {
            result[ids[0]] = group.elements[ids[0]];
        } else {
            const times = ids.map((id) => {
                const e = group.elements[id];
                return { end: e.endTime, start: e.startTime };
            });
            const startTime = Math.min(...times.map((t) => t.start));
            const endTime = Math.max(...times.map((t) => t.end));
            result[root] = {
                ...group,
                endTime,
                eventLength: endTime - startTime,
                id: root,
                instrumentName: group.elements[ids[0]].instrumentName,
                rect: group.elements[ids[0]].rect,
                startTime
            };
        }
    });

    return result;
}

/**
 * Per-instrument sweep-line + union-find to merge overlaps,
 * using isOverlapping for the core test.
 */
function buildGroupsForInstrument(elems) {
    // 1) sort by startTime
    const sorted = elems.slice().sort((a, b) => a.startTime - b.startTime);

    // 2) init UF
    const uf = new UnionFind(sorted.map((e) => e.id));

    // 3) sweep-line active list (sorted by endTime)
    const active = [];

    sorted.forEach((cur) => {
        if (cur.locked) {
            return;
        }

        // evict any that end before or at cur.startTime
        while (active.length > 0 && active[0].endTime <= cur.startTime) {
            active.shift();
        }

        // now only test with the remaining active elements via isOverlapping
        active.forEach((other) => {
            if (!other.locked && isOverlapping(cur, other)) {
                uf.union(cur.id, other.id);
            }
        });

        // insert cur into active, keeping endTime order
        let inserted = false;
        for (let i = 0; i < active.length; i += 1) {
            if (cur.endTime < active[i].endTime) {
                active.splice(i, 0, cur);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            active.push(cur);
        }
    });

    return buildGroupsFromUF(elems, uf);
}

/**
 * processOverlaps: flat array → merged groups per instrument
 */
export function processOverlaps(allElements) {
    // bucket by instrumentName
    const byInst = {};
    allElements.forEach((el) => {
        const inst = el.instrumentName;
        if (!byInst[inst]) {
            byInst[inst] = [];
        }
        byInst[inst].push(el);
    });

    const merged = {};
    Object.entries(byInst).forEach(([inst, list]) => {
        merged[inst] = buildGroupsForInstrument(list);
    });

    // return sorted by instrument key
    return Object.keys(merged)
        .sort()
        .reduce((out, inst) => {
            // eslint-disable-next-line no-param-reassign
            out[inst] = merged[inst];
            return out;
        }, {});
}

/**
 * findOverlaps: takes your processedData map, flattens,
 * runs processOverlaps, and re‑inserts empty instruments.
 */
export function findOverlaps(processedData) {
    if (!processedData) {
        return {};
    }

    // flatten into array
    const flat = Object.entries(processedData).flatMap(([inst, events]) =>
        Object.values(events).map((ev) => ({
            ...ev,
            instrumentName: inst
        }))
    );

    const result = processOverlaps(flat);

    // preserve instruments with no events
    Object.keys(processedData).forEach((inst) => {
        if (!result[inst]) {
            result[inst] = {};
        }
    });

    return result;
}
