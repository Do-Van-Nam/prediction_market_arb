export declare class GatewayController {
    getWsInfo(): {
        url: string;
        transport: string;
        events: {
            serverToClient: string[];
            clientToServer: string[];
        };
    };
}
