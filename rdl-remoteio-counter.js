// module.exports = function(RED) {
//     function RemoteIOCounterNode(config) {
//         RED.nodes.createNode(this, config);
//         const node = this;

//         // simpan status sebelumnya (mirip context.set("stat"))
//         let lastStat = false;
//         const changedAt = Boolean(config.changedAt);

//         node.on('input', function(msg) {

//             const machineID = config.machineID;
//             const index = Number(config.payloadIndex || 0);

//             // handle reset
//             if (msg.reset === true) {
//                 node.context().set(machineID, 0);
//                 lastStat = false;
//                 msg.payload = "reset";
//                 node.status({ fill: "yellow", shape: "dot", text: "reset" });
//                 node.send(msg);
//                 return;
//             }

//             // validasi payload
//             if (!Array.isArray(msg.payload)) {
//                 node.status({ fill: "red", shape: "dot", text: "Payload not array" });
//                 return;
//             }

//             const isAllBoolean = msg.payload.every(v => typeof v === "boolean");
//             if (!isAllBoolean) {
//                 node.status({ fill: "red", shape: "dot", text: "Not boolean array" });
//                 return;
//             }

//             const status = msg.payload[index];

//             if (status === lastStat) return;
//             lastStat = status;

//             if (status !== changedAt) return;   

//             let counter = node.context().flow.get(machineID) || 0;
//             counter++;

//             node.context().set("counter", counter);

//             msg.payload = counter;
//             node.status({ fill: "green", shape: "dot", text: counter.toString() });
//             node.send(msg);
//         });
//     }

//     RED.nodes.registerType(
//         "rdl-remoteio-counter",
//         RemoteIOCounterNode
//     );
// };

module.exports = function (RED) {
    function RemoteIOCounterNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const machineID = String(config.machineID);
        const index = Number(config.payloadIndex || 0);
        const strChangedAt = String(config.changedAt) || "true"

        let changedAt;
        if(strChangedAt === "true"){
            changedAt = true;
        }else{
            changedAt = false;
        }
        


        // context khusus node ini
        const ctx = node.context();

        node.on("input", function (msg) {

            // ambil state dari context (BUKAN variable JS)
            let lastStat = ctx.get("lastStat") || false;
            let counter = ctx.get(machineID) || 0;

            // reset
            if (msg.reset === true) {
                ctx.set(machineID, 0);
                ctx.set("lastStat", false);

                msg.payload = "reset";
                node.status({ fill: "yellow", shape: "dot", text: "reset" });
                node.send(msg);
                return;
            }

            if (!Array.isArray(msg.payload)) {
                node.status({ fill: "red", shape: "dot", text: "Payload not array" });
                return;
            }

            if (!msg.payload.every(v => typeof v === "boolean")) {
                node.status({ fill: "red", shape: "dot", text: "Not boolean array" });
                return;
            }

            const status = msg.payload[index];

            // no change → skip
            if (status === lastStat) return;

            // simpan last state
            ctx.set("lastStat", status);

            if (status !== changedAt) return;

            counter++;
            ctx.set(machineID, counter);

            msg.payload = counter;
            node.status({ fill: "green", shape: "dot", text: counter.toString() });
            node.send(msg);
        });
    }

    RED.nodes.registerType("rdl-remoteio-counter", RemoteIOCounterNode);
};