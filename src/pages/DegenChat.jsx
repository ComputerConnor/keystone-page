import JPChatRoom from "../components/JPChatRoom";


function DegenChat() {

    return (
        <JPChatRoom
            room="degen"
            title="DEGEN WORKROOM"
            description="Identity-masked communications channel."
            allowedCategories={[
                "degen"
            ]}
        />
    );
}


export default DegenChat;
