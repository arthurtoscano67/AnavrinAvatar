module anavrin::avatar {
    use sui::event;
    use sui::coin::{Self as coin, Coin};
    use sui::balance::{Self as balance, Balance};
    use sui::sui::SUI;
    use sui::dynamic_object_field as dof;
    use sui::package;
    use sui::transfer_policy::{Self as transfer_policy};
    use std::string::{Self as string, String};

    // ============================================================
    // One-time witness
    // ============================================================
    public struct AVATAR has drop {}

    // ============================================================
    // Errors
    // ============================================================
    const E_INVALID_SLOT: u64 = 0;
    const E_SLOT_EMPTY: u64 = 1;
    const E_MINT_PAUSED: u64 = 2;
    const E_BAD_PAYMENT: u64 = 3;
    const E_FREE_MINT_ONLY: u64 = 4;

    const E_INVALID_FRAME_TYPE: u64 = 5;
    const E_INVALID_SKIN_TONE: u64 = 6;
    const E_INVALID_HAIR_TYPE: u64 = 7;
    const E_INVALID_HAIR_COLOR: u64 = 8;
    const E_INVALID_HEIGHT: u64 = 9;
    const E_INVALID_BODY_TYPE: u64 = 10;
    const E_INVALID_FACE_STYLE: u64 = 11;
    const E_INVALID_EYE_COLOR: u64 = 12;
    const E_INVALID_EYE_STYLE: u64 = 13;
    const E_INVALID_MOUTH_STYLE: u64 = 14;
    const E_INVALID_FACIAL_HAIR: u64 = 15;
    const E_INVALID_EXPRESSION_PROFILE: u64 = 16;
    const E_INVALID_VOICE_TYPE: u64 = 17;
    const E_INVALID_STYLE_TYPE: u64 = 18;
    const E_INVALID_IDLE_STYLE: u64 = 19;
    const E_INVALID_WALK_STYLE: u64 = 20;
    const E_INVALID_EMOTE_PACK: u64 = 21;

    const E_INVALID_ITEM_CATEGORY: u64 = 22;
    const E_INVALID_INTERACTION_TYPE: u64 = 23;
    const E_INVALID_HOLD_ANCHOR: u64 = 24;
    const E_INVALID_LEVEL_GAIN: u64 = 25;
    const E_NOT_ENOUGH_STAT_POINTS: u64 = 26;
    const E_ZERO_STAT_SPEND: u64 = 27;

    const E_INSUFFICIENT_TREASURY: u64 = 28;
    const E_SLOT_CATEGORY_MISMATCH: u64 = 29;
    const E_INVALID_ATTACHMENT_CONFIG: u64 = 30;
    const E_EMPTY_REQUIRED_STRING: u64 = 31;
    const E_STRING_TOO_LONG: u64 = 32;
    const E_EMPTY_REQUIRED_URI: u64 = 33;
    const E_URI_TOO_LONG: u64 = 34;
    const E_XP_CAP_EXCEEDED: u64 = 35;
    const E_STAT_CAP_EXCEEDED: u64 = 36;
    const E_POINTS_CAP_EXCEEDED: u64 = 37;

    const E_TOO_MANY_ATTRIBUTES: u64 = 38;
    const E_INVALID_ATTRIBUTE: u64 = 39;

    // ============================================================
    // Limits / caps
    // ============================================================
    const MAX_NAME_LENGTH: u64 = 32;
    const MAX_DESCRIPTION_LENGTH: u64 = 280;
    const MAX_SUBTYPE_LENGTH: u64 = 32;
    const MAX_ANIMATION_PROFILE_LENGTH: u64 = 64;
    const MAX_URI_LENGTH: u64 = 512;
    const MAX_ATTRIBUTE_COUNT: u64 = 32;
    const MAX_ATTRIBUTE_KEY_LENGTH: u64 = 32;
    const MAX_ATTRIBUTE_VALUE_LENGTH: u64 = 64;

    const MAX_XP: u64 = 1000000000;
    const MAX_BASE_STAT_VALUE: u64 = 1000000;
    const MAX_EFFECTIVE_STAT_VALUE: u64 = 5000000;
    const MAX_UNSPENT_STAT_POINTS: u64 = 1000000;

    // ============================================================
    // Equipment slots
    // ============================================================
    const SLOT_HEAD: u8 = 0;
    const SLOT_FACE: u8 = 1;
    const SLOT_NECK: u8 = 2;
    const SLOT_UPPER_BODY: u8 = 3;
    const SLOT_LOWER_BODY: u8 = 4;
    const SLOT_FEET: u8 = 5;
    const SLOT_WRIST_LEFT: u8 = 6;
    const SLOT_WRIST_RIGHT: u8 = 7;
    const SLOT_HAND_LEFT: u8 = 8;
    const SLOT_HAND_RIGHT: u8 = 9;
    const SLOT_BACK: u8 = 10;
    const SLOT_SKIN_HEAD: u8 = 11;
    const SLOT_SKIN_UPPER: u8 = 12;
    const SLOT_SKIN_LOWER: u8 = 13;
    const SLOT_PET: u8 = 14;
    const SLOT_VEHICLE: u8 = 15;
    const SLOT_AURA: u8 = 16;
    const SLOT_EMOTE: u8 = 17;
    const SLOT_VOICE: u8 = 18;

    // ============================================================
    // Body frame / presentation
    // ============================================================
    const FRAME_MASCULINE: u8 = 0;
    const FRAME_FEMININE: u8 = 1;

    // ============================================================
    // Skin tones
    // ============================================================
    const SKIN_LIGHT_PEACH: u8 = 0;
    const SKIN_PEACH: u8 = 1;
    const SKIN_PEACH_BROWN: u8 = 2;
    const SKIN_BROWN: u8 = 3;
    const SKIN_DARK_BROWN: u8 = 4;

    // ============================================================
    // Hair types
    // ============================================================
    const HAIR_BALD: u8 = 0;
    const HAIR_SHORT: u8 = 1;
    const HAIR_LONG: u8 = 2;
    const HAIR_CURLY: u8 = 3;
    const HAIR_BRAIDS: u8 = 4;
    const HAIR_LOCS: u8 = 5;
    const HAIR_PONYTAIL: u8 = 6;
    const HAIR_BUZZ: u8 = 7;
    const HAIR_WAVY: u8 = 8;

    // ============================================================
    // Hair colors
    // ============================================================
    const HAIR_BLACK: u8 = 0;
    const HAIR_DARK_BROWN: u8 = 1;
    const HAIR_BROWN: u8 = 2;
    const HAIR_LIGHT_BROWN: u8 = 3;
    const HAIR_BLONDE: u8 = 4;
    const HAIR_RED: u8 = 5;
    const HAIR_GRAY: u8 = 6;
    const HAIR_WHITE_SILVER: u8 = 7;
    const HAIR_BLUE: u8 = 8;
    const HAIR_PINK: u8 = 9;

    // ============================================================
    // Height classes
    // ============================================================
    const HEIGHT_SHORT: u8 = 0;
    const HEIGHT_AVERAGE: u8 = 1;
    const HEIGHT_TALL: u8 = 2;

    // ============================================================
    // Body types
    // ============================================================
    const BODY_SLIM: u8 = 0;
    const BODY_ATHLETIC: u8 = 1;
    const BODY_HEAVY: u8 = 2;

    // ============================================================
    // Face / eyes / mouth
    // ============================================================
    const FACE_1: u8 = 0;
    const FACE_2: u8 = 1;
    const FACE_3: u8 = 2;
    const FACE_4: u8 = 3;
    const FACE_5: u8 = 4;
    const FACE_6: u8 = 5;

    const EYES_BROWN: u8 = 0;
    const EYES_DARK_BROWN: u8 = 1;
    const EYES_HAZEL: u8 = 2;
    const EYES_BLUE: u8 = 3;
    const EYES_GREEN: u8 = 4;
    const EYES_GRAY: u8 = 5;

    const EYE_STYLE_ROUND: u8 = 0;
    const EYE_STYLE_ALMOND: u8 = 1;
    const EYE_STYLE_SHARP: u8 = 2;
    const EYE_STYLE_SOFT: u8 = 3;
    const EYE_STYLE_SLEEPY: u8 = 4;
    const EYE_STYLE_WIDE: u8 = 5;

    const MOUTH_STYLE_NEUTRAL: u8 = 0;
    const MOUTH_STYLE_SOFT_SMILE: u8 = 1;
    const MOUTH_STYLE_FULL: u8 = 2;
    const MOUTH_STYLE_THIN: u8 = 3;
    const MOUTH_STYLE_DEFINED: u8 = 4;
    const MOUTH_STYLE_YOUTHFUL: u8 = 5;

    const FACIAL_NONE: u8 = 0;
    const FACIAL_MUSTACHE: u8 = 1;
    const FACIAL_GOATEE: u8 = 2;
    const FACIAL_SHORT_BEARD: u8 = 3;
    const FACIAL_FULL_BEARD: u8 = 4;

    // ============================================================
    // Expression / voice / style / movement / emotes
    // ============================================================
    const EXPRESSION_CALM: u8 = 0;
    const EXPRESSION_CONFIDENT: u8 = 1;
    const EXPRESSION_PLAYFUL: u8 = 2;
    const EXPRESSION_SERIOUS: u8 = 3;
    const EXPRESSION_AGGRESSIVE: u8 = 4;
    const EXPRESSION_SHY: u8 = 5;

    const VOICE_CALM: u8 = 0;
    const VOICE_ENERGETIC: u8 = 1;
    const VOICE_DEEP: u8 = 2;
    const VOICE_PLAYFUL: u8 = 3;
    const VOICE_ROBOTIC: u8 = 4;
    const VOICE_MYSTERIOUS: u8 = 5;

    const STYLE_STREET: u8 = 0;
    const STYLE_TACTICAL: u8 = 1;
    const STYLE_LUXURY: u8 = 2;
    const STYLE_SPORTY: u8 = 3;
    const STYLE_FUTURISTIC: u8 = 4;
    const STYLE_CASUAL: u8 = 5;

    const IDLE_RELAXED: u8 = 0;
    const IDLE_ALERT: u8 = 1;
    const IDLE_TOUGH: u8 = 2;
    const IDLE_HEROIC: u8 = 3;
    const IDLE_SNEAKY: u8 = 4;

    const WALK_NORMAL: u8 = 0;
    const WALK_SWAGGER: u8 = 1;
    const WALK_STEALTH: u8 = 2;
    const WALK_HEAVY: u8 = 3;
    const WALK_CONFIDENT: u8 = 4;

    const EMOTE_BASIC: u8 = 0;
    const EMOTE_FUN: u8 = 1;
    const EMOTE_FIGHTER: u8 = 2;
    const EMOTE_HERO: u8 = 3;
    const EMOTE_VILLAIN: u8 = 4;

    // ============================================================
    // Universal item categories / interactions / anchors
    // ============================================================
    const ITEM_CATEGORY_CLOTHING: u8 = 0;
    const ITEM_CATEGORY_PROP: u8 = 1;
    const ITEM_CATEGORY_VEHICLE: u8 = 2;
    const ITEM_CATEGORY_PET: u8 = 3;
    const ITEM_CATEGORY_AURA: u8 = 4;
    const ITEM_CATEGORY_TOOL: u8 = 5;
    const ITEM_CATEGORY_EMOTE_PACK: u8 = 6;
    const ITEM_CATEGORY_VOICE_PACK: u8 = 7;

    const INTERACTION_NONE: u8 = 0;
    const INTERACTION_DRINK: u8 = 1;
    const INTERACTION_EAT: u8 = 2;
    const INTERACTION_PHONE: u8 = 3;
    const INTERACTION_DRIVE_CAR: u8 = 4;
    const INTERACTION_RIDE_MOTORCYCLE: u8 = 5;
    const INTERACTION_RIDE_BICYCLE: u8 = 6;
    const INTERACTION_PET: u8 = 7;
    const INTERACTION_DANCE: u8 = 8;
    const INTERACTION_INSPECT: u8 = 9;

    const HOLD_NONE: u8 = 0;
    const HOLD_LEFT_HAND: u8 = 1;
    const HOLD_RIGHT_HAND: u8 = 2;
    const HOLD_BOTH_HANDS: u8 = 3;
    const HOLD_BACK_MOUNT: u8 = 4;
    const HOLD_VEHICLE_SEAT: u8 = 5;

    // ============================================================
    // Admin / config
    // ============================================================
    public struct AdminCap has key, store {
        id: UID,
    }

    public struct MintConfig has key {
        id: UID,
        mint_price_mist: u64,
        mint_enabled: bool,
        treasury: Balance<SUI>,
    }

    // ============================================================
    // Metadata / reusable data
    // ============================================================
    public struct Attribute has store, copy, drop {
        trait_type: String,
        value: String,
    }

    public struct StatBlock has store, copy, drop {
        stamina: u64,
        shooting: u64,
        strength: u64,
        stealth: u64,
        flying: u64,
        driving: u64,
        lung_capacity: u64,
    }

    public struct Appearance has store, copy, drop {
        frame_type: u8,
        skin_tone: u8,
        hair_type: u8,
        hair_color: u8,
        height_class: u8,
        body_type: u8,
        face_style: u8,
        eye_color: u8,
        eye_style: u8,
        mouth_style: u8,
        facial_hair: u8,
    }

    public struct BehaviorProfile has store, copy, drop {
        expression_profile: u8,
        voice_type: u8,
        style_type: u8,
        idle_style: u8,
        walk_style: u8,
        base_emote_pack: u8,
    }

    public struct Avatar has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        attributes: vector<Attribute>,

        level: u64,
        xp: u64,
        unspent_stat_points: u64,

        appearance: Appearance,
        behavior: BehaviorProfile,

        base_stats: StatBlock,
        effective_stats: StatBlock,

        base_model_uri: String,
        portrait_uri: String,
    }

    public struct Attachment has key, store {
        id: UID,
        name: String,
        slot: u8,
        category: u8,
        subtype: String,
        model_uri: String,
        texture_uri: String,
        animation_profile: String,
        interaction_type: u8,
        hold_anchor: u8,
        bonus_stats: StatBlock,
    }

    // ============================================================
    // Events
    // ============================================================
    public struct AvatarMinted has copy, drop {
        avatar_id: ID,
        owner: address,
    }

    public struct AttachmentMinted has copy, drop {
        attachment_id: ID,
        owner: address,
        slot: u8,
        category: u8,
        interaction_type: u8,
    }

    public struct Equipped has copy, drop {
        avatar_id: ID,
        attachment_id: ID,
        owner: address,
        slot: u8,
    }

    public struct Unequipped has copy, drop {
        avatar_id: ID,
        attachment_id: ID,
        owner: address,
        slot: u8,
    }

    public struct XpGained has copy, drop {
        avatar_id: ID,
        gained_xp: u64,
        new_xp: u64,
        old_level: u64,
        new_level: u64,
        gained_stat_points: u64,
        new_unspent_stat_points: u64,
    }

    public struct StatPointsSpent has copy, drop {
        avatar_id: ID,
        spent_points: u64,
        remaining_points: u64,
    }

    public struct StatsUpdated has copy, drop {
        avatar_id: ID,
        level: u64,
        xp: u64,
        unspent_stat_points: u64,
        stamina: u64,
        shooting: u64,
        strength: u64,
        stealth: u64,
        flying: u64,
        driving: u64,
        lung_capacity: u64,
    }

    public struct AppearanceUpdated has copy, drop {
        avatar_id: ID,
    }

    public struct BehaviorUpdated has copy, drop {
        avatar_id: ID,
    }

    public struct RenderUrisUpdated has copy, drop {
        avatar_id: ID,
    }

    public struct MarketMetadataUpdated has copy, drop {
        avatar_id: ID,
    }

    // ============================================================
    // Init
    // Creates:
    // - AdminCap
    // - shared MintConfig
    // - Publisher object (kept by publisher)
    // - shared TransferPolicy<Avatar>
    // - TransferPolicyCap<Avatar> (kept by publisher)
    // ============================================================
    #[allow(lint(share_owned))]
    fun init(otw: AVATAR, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let (policy, policy_cap) = transfer_policy::new<Avatar>(&publisher, ctx);

        let admin = AdminCap { id: object::new(ctx) };
        let config = MintConfig {
            id: object::new(ctx),
            mint_price_mist: 0,
            mint_enabled: false,
            treasury: balance::zero(),
        };

        let sender = tx_context::sender(ctx);

        transfer::public_transfer(admin, sender);
        transfer::share_object(config);

        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, sender);
        transfer::public_transfer(publisher, sender);
    }

    // ============================================================
    // Optional helper if you ever want an extra policy.
    // ============================================================
    #[allow(lint(share_owned))]
    entry fun create_avatar_transfer_policy_with_lock_rule(
        pub: &package::Publisher,
        ctx: &mut TxContext
    ) {
        let (policy, policy_cap) = transfer_policy::new<Avatar>(pub, ctx);
        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, tx_context::sender(ctx));
    }

    // ============================================================
    // Admin controls
    // ============================================================
    entry fun set_mint_price(
        _cap: &AdminCap,
        config: &mut MintConfig,
        new_price_mist: u64
    ) {
        config.mint_price_mist = new_price_mist;
    }

    entry fun pause_mint(_cap: &AdminCap, config: &mut MintConfig) {
        config.mint_enabled = false;
    }

    entry fun resume_mint(_cap: &AdminCap, config: &mut MintConfig) {
        config.mint_enabled = true;
    }

    entry fun withdraw_treasury(
        _cap: &AdminCap,
        config: &mut MintConfig,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(balance::value(&config.treasury) >= amount, E_INSUFFICIENT_TREASURY);

        let sender = tx_context::sender(ctx);
        let payout = coin::take(&mut config.treasury, amount, ctx);
        transfer::public_transfer(payout, sender);
    }

    // ============================================================
    // Public mint
    // ============================================================
    entry fun mint_avatar(
        config: &mut MintConfig,
        payment: Coin<SUI>,

        name: String,
        description: String,
        image_url: String,
        attributes: vector<Attribute>,

        frame_type: u8,
        skin_tone: u8,
        hair_type: u8,
        hair_color: u8,
        height_class: u8,
        body_type: u8,
        face_style: u8,
        eye_color: u8,
        eye_style: u8,
        mouth_style: u8,
        facial_hair: u8,

        expression_profile: u8,
        voice_type: u8,
        style_type: u8,
        idle_style: u8,
        walk_style: u8,
        base_emote_pack: u8,

        base_model_uri: String,
        portrait_uri: String,
        ctx: &mut TxContext
    ) {
        assert!(config.mint_enabled, E_MINT_PAUSED);

        validate_avatar_market_metadata(
            &name,
            &description,
            &image_url,
            &base_model_uri,
            &portrait_uri,
            &attributes
        );
        validate_appearance(
            frame_type,
            skin_tone,
            hair_type,
            hair_color,
            height_class,
            body_type,
            face_style,
            eye_color,
            eye_style,
            mouth_style,
            facial_hair
        );
        validate_behavior(
            expression_profile,
            voice_type,
            style_type,
            idle_style,
            walk_style,
            base_emote_pack
        );

        let price = config.mint_price_mist;
        let paid = coin::value(&payment);
        assert!(paid >= price, E_BAD_PAYMENT);

        let sender = tx_context::sender(ctx);
        let mut payment_mut = payment;

        if (paid > price) {
            let refund = coin::split(&mut payment_mut, paid - price, ctx);
            transfer::public_transfer(refund, sender);
        };

        balance::join(&mut config.treasury, coin::into_balance(payment_mut));

        let base_stats = starter_stats();

        let avatar = Avatar {
            id: object::new(ctx),

            name,
            description,
            image_url,
            attributes,

            level: 1,
            xp: 0,
            unspent_stat_points: 0,

            appearance: Appearance {
                frame_type,
                skin_tone,
                hair_type,
                hair_color,
                height_class,
                body_type,
                face_style,
                eye_color,
                eye_style,
                mouth_style,
                facial_hair,
            },
            behavior: BehaviorProfile {
                expression_profile,
                voice_type,
                style_type,
                idle_style,
                walk_style,
                base_emote_pack,
            },

            base_stats,
            effective_stats: base_stats,

            base_model_uri,
            portrait_uri,
        };

        let avatar_id = object::id(&avatar);

        event::emit(AvatarMinted { avatar_id, owner: sender });
        event::emit(StatsUpdated {
            avatar_id,
            level: 1,
            xp: 0,
            unspent_stat_points: 0,
            stamina: base_stats.stamina,
            shooting: base_stats.shooting,
            strength: base_stats.strength,
            stealth: base_stats.stealth,
            flying: base_stats.flying,
            driving: base_stats.driving,
            lung_capacity: base_stats.lung_capacity,
        });

        transfer::public_transfer(avatar, sender);
    }

    entry fun mint_avatar_free(
        config: &MintConfig,

        name: String,
        description: String,
        image_url: String,
        attributes: vector<Attribute>,

        frame_type: u8,
        skin_tone: u8,
        hair_type: u8,
        hair_color: u8,
        height_class: u8,
        body_type: u8,
        face_style: u8,
        eye_color: u8,
        eye_style: u8,
        mouth_style: u8,
        facial_hair: u8,

        expression_profile: u8,
        voice_type: u8,
        style_type: u8,
        idle_style: u8,
        walk_style: u8,
        base_emote_pack: u8,

        base_model_uri: String,
        portrait_uri: String,
        ctx: &mut TxContext
    ) {
        assert!(config.mint_enabled, E_MINT_PAUSED);
        assert!(config.mint_price_mist == 0, E_FREE_MINT_ONLY);

        validate_avatar_market_metadata(
            &name,
            &description,
            &image_url,
            &base_model_uri,
            &portrait_uri,
            &attributes
        );
        validate_appearance(
            frame_type,
            skin_tone,
            hair_type,
            hair_color,
            height_class,
            body_type,
            face_style,
            eye_color,
            eye_style,
            mouth_style,
            facial_hair
        );
        validate_behavior(
            expression_profile,
            voice_type,
            style_type,
            idle_style,
            walk_style,
            base_emote_pack
        );

        let sender = tx_context::sender(ctx);
        let base_stats = starter_stats();

        let avatar = Avatar {
            id: object::new(ctx),

            name,
            description,
            image_url,
            attributes,

            level: 1,
            xp: 0,
            unspent_stat_points: 0,

            appearance: Appearance {
                frame_type,
                skin_tone,
                hair_type,
                hair_color,
                height_class,
                body_type,
                face_style,
                eye_color,
                eye_style,
                mouth_style,
                facial_hair,
            },
            behavior: BehaviorProfile {
                expression_profile,
                voice_type,
                style_type,
                idle_style,
                walk_style,
                base_emote_pack,
            },

            base_stats,
            effective_stats: base_stats,

            base_model_uri,
            portrait_uri,
        };

        let avatar_id = object::id(&avatar);

        event::emit(AvatarMinted { avatar_id, owner: sender });
        event::emit(StatsUpdated {
            avatar_id,
            level: 1,
            xp: 0,
            unspent_stat_points: 0,
            stamina: base_stats.stamina,
            shooting: base_stats.shooting,
            strength: base_stats.strength,
            stealth: base_stats.stealth,
            flying: base_stats.flying,
            driving: base_stats.driving,
            lung_capacity: base_stats.lung_capacity,
        });

        transfer::public_transfer(avatar, sender);
    }

    entry fun admin_mint_avatar(
        _cap: &AdminCap,
        recipient: address,

        name: String,
        description: String,
        image_url: String,
        attributes: vector<Attribute>,

        frame_type: u8,
        skin_tone: u8,
        hair_type: u8,
        hair_color: u8,
        height_class: u8,
        body_type: u8,
        face_style: u8,
        eye_color: u8,
        eye_style: u8,
        mouth_style: u8,
        facial_hair: u8,

        expression_profile: u8,
        voice_type: u8,
        style_type: u8,
        idle_style: u8,
        walk_style: u8,
        base_emote_pack: u8,

        base_model_uri: String,
        portrait_uri: String,

        stamina: u64,
        shooting: u64,
        strength: u64,
        stealth: u64,
        flying: u64,
        driving: u64,
        lung_capacity: u64,

        ctx: &mut TxContext
    ) {
        validate_avatar_market_metadata(
            &name,
            &description,
            &image_url,
            &base_model_uri,
            &portrait_uri,
            &attributes
        );
        validate_appearance(
            frame_type,
            skin_tone,
            hair_type,
            hair_color,
            height_class,
            body_type,
            face_style,
            eye_color,
            eye_style,
            mouth_style,
            facial_hair
        );
        validate_behavior(
            expression_profile,
            voice_type,
            style_type,
            idle_style,
            walk_style,
            base_emote_pack
        );

        validate_base_stat_value(stamina);
        validate_base_stat_value(shooting);
        validate_base_stat_value(strength);
        validate_base_stat_value(stealth);
        validate_base_stat_value(flying);
        validate_base_stat_value(driving);
        validate_base_stat_value(lung_capacity);

        let base_stats = StatBlock {
            stamina,
            shooting,
            strength,
            stealth,
            flying,
            driving,
            lung_capacity,
        };

        let avatar = Avatar {
            id: object::new(ctx),

            name,
            description,
            image_url,
            attributes,

            level: 1,
            xp: 0,
            unspent_stat_points: 0,

            appearance: Appearance {
                frame_type,
                skin_tone,
                hair_type,
                hair_color,
                height_class,
                body_type,
                face_style,
                eye_color,
                eye_style,
                mouth_style,
                facial_hair,
            },
            behavior: BehaviorProfile {
                expression_profile,
                voice_type,
                style_type,
                idle_style,
                walk_style,
                base_emote_pack,
            },

            base_stats,
            effective_stats: base_stats,

            base_model_uri,
            portrait_uri,
        };

        let avatar_id = object::id(&avatar);

        event::emit(AvatarMinted { avatar_id, owner: recipient });
        event::emit(StatsUpdated {
            avatar_id,
            level: 1,
            xp: 0,
            unspent_stat_points: 0,
            stamina: base_stats.stamina,
            shooting: base_stats.shooting,
            strength: base_stats.strength,
            stealth: base_stats.stealth,
            flying: base_stats.flying,
            driving: base_stats.driving,
            lung_capacity: base_stats.lung_capacity,
        });

        transfer::public_transfer(avatar, recipient);
    }

    // ============================================================
    // Admin-only universal object mint
    // ============================================================
    entry fun admin_mint_attachment(
        _cap: &AdminCap,
        recipient: address,
        name: String,
        slot: u8,
        category: u8,
        subtype: String,
        model_uri: String,
        texture_uri: String,
        animation_profile: String,
        interaction_type: u8,
        hold_anchor: u8,
        stamina_bonus: u64,
        shooting_bonus: u64,
        strength_bonus: u64,
        stealth_bonus: u64,
        flying_bonus: u64,
        driving_bonus: u64,
        lung_capacity_bonus: u64,
        ctx: &mut TxContext
    ) {
        validate_attachment_strings(
            &name,
            &subtype,
            &model_uri,
            &texture_uri,
            &animation_profile
        );

        assert!(valid_slot(slot), E_INVALID_SLOT);
        assert!(valid_item_category(category), E_INVALID_ITEM_CATEGORY);
        assert!(valid_interaction_type(interaction_type), E_INVALID_INTERACTION_TYPE);
        assert!(valid_hold_anchor(hold_anchor), E_INVALID_HOLD_ANCHOR);
        assert!(slot_accepts_category(slot, category), E_SLOT_CATEGORY_MISMATCH);
        assert!(
            attachment_configuration_is_valid(slot, category, interaction_type, hold_anchor),
            E_INVALID_ATTACHMENT_CONFIG
        );

        validate_effective_stat_value(stamina_bonus);
        validate_effective_stat_value(shooting_bonus);
        validate_effective_stat_value(strength_bonus);
        validate_effective_stat_value(stealth_bonus);
        validate_effective_stat_value(flying_bonus);
        validate_effective_stat_value(driving_bonus);
        validate_effective_stat_value(lung_capacity_bonus);

        let item = Attachment {
            id: object::new(ctx),
            name,
            slot,
            category,
            subtype,
            model_uri,
            texture_uri,
            animation_profile,
            interaction_type,
            hold_anchor,
            bonus_stats: StatBlock {
                stamina: stamina_bonus,
                shooting: shooting_bonus,
                strength: strength_bonus,
                stealth: stealth_bonus,
                flying: flying_bonus,
                driving: driving_bonus,
                lung_capacity: lung_capacity_bonus,
            },
        };

        let attachment_id = object::id(&item);

        event::emit(AttachmentMinted {
            attachment_id,
            owner: recipient,
            slot,
            category,
            interaction_type,
        });

        transfer::public_transfer(item, recipient);
    }

    // ============================================================
    // Post-mint avatar customization
    // ============================================================
    entry fun update_appearance(
        avatar: &mut Avatar,
        frame_type: u8,
        skin_tone: u8,
        hair_type: u8,
        hair_color: u8,
        height_class: u8,
        body_type: u8,
        face_style: u8,
        eye_color: u8,
        eye_style: u8,
        mouth_style: u8,
        facial_hair: u8
    ) {
        validate_appearance(
            frame_type,
            skin_tone,
            hair_type,
            hair_color,
            height_class,
            body_type,
            face_style,
            eye_color,
            eye_style,
            mouth_style,
            facial_hair
        );

        avatar.appearance = Appearance {
            frame_type,
            skin_tone,
            hair_type,
            hair_color,
            height_class,
            body_type,
            face_style,
            eye_color,
            eye_style,
            mouth_style,
            facial_hair,
        };

        event::emit(AppearanceUpdated {
            avatar_id: object::id(avatar),
        });
    }

    entry fun update_behavior(
        avatar: &mut Avatar,
        expression_profile: u8,
        voice_type: u8,
        style_type: u8,
        idle_style: u8,
        walk_style: u8,
        base_emote_pack: u8
    ) {
        validate_behavior(
            expression_profile,
            voice_type,
            style_type,
            idle_style,
            walk_style,
            base_emote_pack
        );

        avatar.behavior = BehaviorProfile {
            expression_profile,
            voice_type,
            style_type,
            idle_style,
            walk_style,
            base_emote_pack,
        };

        event::emit(BehaviorUpdated {
            avatar_id: object::id(avatar),
        });
    }

    entry fun update_render_uris(
        avatar: &mut Avatar,
        base_model_uri: String,
        portrait_uri: String
    ) {
        validate_required_uri(&base_model_uri);
        validate_required_uri(&portrait_uri);

        avatar.base_model_uri = base_model_uri;
        avatar.portrait_uri = portrait_uri;

        event::emit(RenderUrisUpdated {
            avatar_id: object::id(avatar),
        });
    }

    entry fun update_market_metadata(
        avatar: &mut Avatar,
        description: String,
        image_url: String,
        attributes: vector<Attribute>
    ) {
        validate_required_string(&description, MAX_DESCRIPTION_LENGTH);
        validate_required_uri(&image_url);
        validate_attributes(&attributes);

        avatar.description = description;
        avatar.image_url = image_url;
        avatar.attributes = attributes;

        event::emit(MarketMetadataUpdated {
            avatar_id: object::id(avatar),
        });
    }

    // ============================================================
    // Dynamic object field equip / unequip
    // ============================================================
    entry fun equip(
        avatar: &mut Avatar,
        attachment: Attachment,
        ctx: &TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let avatar_id = object::id(avatar);
        let attachment_id = object::id(&attachment);
        let slot = attachment.slot;
        let category = attachment.category;
        let interaction_type = attachment.interaction_type;
        let hold_anchor = attachment.hold_anchor;

        assert!(valid_slot(slot), E_INVALID_SLOT);
        assert!(valid_item_category(category), E_INVALID_ITEM_CATEGORY);
        assert!(valid_interaction_type(interaction_type), E_INVALID_INTERACTION_TYPE);
        assert!(valid_hold_anchor(hold_anchor), E_INVALID_HOLD_ANCHOR);
        assert!(slot_accepts_category(slot, category), E_SLOT_CATEGORY_MISMATCH);
        assert!(
            attachment_configuration_is_valid(slot, category, interaction_type, hold_anchor),
            E_INVALID_ATTACHMENT_CONFIG
        );

        if (slot == SLOT_HAND_LEFT || slot == SLOT_HAND_RIGHT) {
            let opposite = other_hand_slot(slot);
            let new_uses_both = hold_anchor == HOLD_BOTH_HANDS;

            let opposite_uses_both =
                if (dof::exists_<u8>(&avatar.id, opposite)) {
                    let other_hold = dof::borrow<u8, Attachment>(&avatar.id, opposite).hold_anchor;
                    other_hold == HOLD_BOTH_HANDS
                } else {
                    false
                };

            if (new_uses_both || opposite_uses_both) {
                remove_slot_if_present(avatar, opposite, owner, avatar_id);
            };
        };

        remove_slot_if_present(avatar, slot, owner, avatar_id);

        dof::add(&mut avatar.id, slot, attachment);
        recompute_effective_stats(avatar);

        event::emit(Equipped {
            avatar_id,
            attachment_id,
            owner,
            slot,
        });

        emit_stats_updated(avatar);
    }

    entry fun unequip(
        avatar: &mut Avatar,
        slot: u8,
        ctx: &TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let avatar_id = object::id(avatar);

        assert!(valid_slot(slot), E_INVALID_SLOT);
        assert!(dof::exists_<u8>(&avatar.id, slot), E_SLOT_EMPTY);

        let item = dof::remove<u8, Attachment>(&mut avatar.id, slot);
        let attachment_id = object::id(&item);

        transfer::public_transfer(item, owner);
        recompute_effective_stats(avatar);

        event::emit(Unequipped {
            avatar_id,
            attachment_id,
            owner,
            slot,
        });

        emit_stats_updated(avatar);
    }

    // ============================================================
    // XP / level / stat points
    // ============================================================
    entry fun admin_grant_xp(
        _cap: &AdminCap,
        avatar: &mut Avatar,
        amount: u64
    ) {
        let old_level = avatar.level;
        avatar.xp = add_with_cap(avatar.xp, amount, MAX_XP, E_XP_CAP_EXCEEDED);

        let new_level = level_from_xp(avatar.xp);
        assert!(new_level >= old_level, E_INVALID_LEVEL_GAIN);

        let gained_points = stat_points_between_levels(old_level, new_level);
        avatar.level = new_level;
        avatar.unspent_stat_points = add_with_cap(
            avatar.unspent_stat_points,
            gained_points,
            MAX_UNSPENT_STAT_POINTS,
            E_POINTS_CAP_EXCEEDED
        );

        recompute_effective_stats(avatar);

        event::emit(XpGained {
            avatar_id: object::id(avatar),
            gained_xp: amount,
            new_xp: avatar.xp,
            old_level,
            new_level,
            gained_stat_points: gained_points,
            new_unspent_stat_points: avatar.unspent_stat_points,
        });

        emit_stats_updated(avatar);
    }

    entry fun spend_stat_points(
        avatar: &mut Avatar,
        stamina_points: u64,
        shooting_points: u64,
        strength_points: u64,
        stealth_points: u64,
        flying_points: u64,
        driving_points: u64,
        lung_capacity_points: u64
    ) {
        let total_1 = add_with_cap(stamina_points, shooting_points, avatar.unspent_stat_points, E_NOT_ENOUGH_STAT_POINTS);
        let total_2 = add_with_cap(total_1, strength_points, avatar.unspent_stat_points, E_NOT_ENOUGH_STAT_POINTS);
        let total_3 = add_with_cap(total_2, stealth_points, avatar.unspent_stat_points, E_NOT_ENOUGH_STAT_POINTS);
        let total_4 = add_with_cap(total_3, flying_points, avatar.unspent_stat_points, E_NOT_ENOUGH_STAT_POINTS);
        let total_5 = add_with_cap(total_4, driving_points, avatar.unspent_stat_points, E_NOT_ENOUGH_STAT_POINTS);
        let total = add_with_cap(total_5, lung_capacity_points, avatar.unspent_stat_points, E_NOT_ENOUGH_STAT_POINTS);

        assert!(total > 0, E_ZERO_STAT_SPEND);
        assert!(avatar.unspent_stat_points >= total, E_NOT_ENOUGH_STAT_POINTS);

        avatar.base_stats.stamina = add_with_cap(
            avatar.base_stats.stamina,
            stamina_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );
        avatar.base_stats.shooting = add_with_cap(
            avatar.base_stats.shooting,
            shooting_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );
        avatar.base_stats.strength = add_with_cap(
            avatar.base_stats.strength,
            strength_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );
        avatar.base_stats.stealth = add_with_cap(
            avatar.base_stats.stealth,
            stealth_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );
        avatar.base_stats.flying = add_with_cap(
            avatar.base_stats.flying,
            flying_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );
        avatar.base_stats.driving = add_with_cap(
            avatar.base_stats.driving,
            driving_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );
        avatar.base_stats.lung_capacity = add_with_cap(
            avatar.base_stats.lung_capacity,
            lung_capacity_points,
            MAX_BASE_STAT_VALUE,
            E_STAT_CAP_EXCEEDED
        );

        avatar.unspent_stat_points = avatar.unspent_stat_points - total;
        recompute_effective_stats(avatar);

        event::emit(StatPointsSpent {
            avatar_id: object::id(avatar),
            spent_points: total,
            remaining_points: avatar.unspent_stat_points,
        });

        emit_stats_updated(avatar);
    }

    public fun level_from_xp(xp: u64): u64 {
        let r0 = xp;

        if (r0 < 900) {
            return 1 + (r0 / 100)
        };

        let r1 = r0 - 900;

        if (r1 < 3750) {
            return 10 + (r1 / 250)
        };

        let r2 = r1 - 3750;

        if (r2 < 12500) {
            return 25 + (r2 / 500)
        };

        let r3 = r2 - 12500;

        if (r3 < 50000) {
            return 50 + (r3 / 1000)
        };

        let r4 = r3 - 50000;

        100 + (r4 / 2000)
    }

    fun stat_points_between_levels(old_level: u64, new_level: u64): u64 {
        if (new_level <= old_level) {
            return 0
        };

        cumulative_stat_points_for_level(new_level) - cumulative_stat_points_for_level(old_level)
    }

    fun cumulative_stat_points_for_level(level: u64): u64 {
        if (level <= 1) {
            return 0
        };

        let gained_levels = level - 1;
        gained_levels + (level / 5)
    }

    // ============================================================
    // Validation
    // ============================================================
    fun validate_appearance(
        frame_type: u8,
        skin_tone: u8,
        hair_type: u8,
        hair_color: u8,
        height_class: u8,
        body_type: u8,
        face_style: u8,
        eye_color: u8,
        eye_style: u8,
        mouth_style: u8,
        facial_hair: u8
    ) {
        assert!(valid_frame_type(frame_type), E_INVALID_FRAME_TYPE);
        assert!(valid_skin_tone(skin_tone), E_INVALID_SKIN_TONE);
        assert!(valid_hair_type(hair_type), E_INVALID_HAIR_TYPE);
        assert!(valid_hair_color(hair_color), E_INVALID_HAIR_COLOR);
        assert!(valid_height_class(height_class), E_INVALID_HEIGHT);
        assert!(valid_body_type(body_type), E_INVALID_BODY_TYPE);
        assert!(valid_face_style(face_style), E_INVALID_FACE_STYLE);
        assert!(valid_eye_color(eye_color), E_INVALID_EYE_COLOR);
        assert!(valid_eye_style(eye_style), E_INVALID_EYE_STYLE);
        assert!(valid_mouth_style(mouth_style), E_INVALID_MOUTH_STYLE);
        assert!(valid_facial_hair(facial_hair), E_INVALID_FACIAL_HAIR);
    }

    fun validate_behavior(
        expression_profile: u8,
        voice_type: u8,
        style_type: u8,
        idle_style: u8,
        walk_style: u8,
        base_emote_pack: u8
    ) {
        assert!(valid_expression_profile(expression_profile), E_INVALID_EXPRESSION_PROFILE);
        assert!(valid_voice_type(voice_type), E_INVALID_VOICE_TYPE);
        assert!(valid_style_type(style_type), E_INVALID_STYLE_TYPE);
        assert!(valid_idle_style(idle_style), E_INVALID_IDLE_STYLE);
        assert!(valid_walk_style(walk_style), E_INVALID_WALK_STYLE);
        assert!(valid_emote_pack(base_emote_pack), E_INVALID_EMOTE_PACK);
    }

    fun validate_avatar_market_metadata(
        name: &String,
        description: &String,
        image_url: &String,
        base_model_uri: &String,
        portrait_uri: &String,
        attributes: &vector<Attribute>
    ) {
        validate_required_string(name, MAX_NAME_LENGTH);
        validate_required_string(description, MAX_DESCRIPTION_LENGTH);
        validate_required_uri(image_url);
        validate_required_uri(base_model_uri);
        validate_required_uri(portrait_uri);
        validate_attributes(attributes);
    }

    fun validate_attachment_strings(
        name: &String,
        subtype: &String,
        model_uri: &String,
        texture_uri: &String,
        animation_profile: &String
    ) {
        validate_required_string(name, MAX_NAME_LENGTH);
        validate_required_string(subtype, MAX_SUBTYPE_LENGTH);
        validate_required_uri(model_uri);
        validate_optional_uri(texture_uri);
        validate_optional_string(animation_profile, MAX_ANIMATION_PROFILE_LENGTH);
    }

    fun validate_attributes(attrs: &vector<Attribute>) {
        let len = vector::length(attrs);
        assert!(len <= MAX_ATTRIBUTE_COUNT, E_TOO_MANY_ATTRIBUTES);

        let mut i = 0;
        while (i < len) {
            let attr = vector::borrow(attrs, i);
            assert!(string::length(&attr.trait_type) > 0, E_INVALID_ATTRIBUTE);
            assert!(string::length(&attr.trait_type) <= MAX_ATTRIBUTE_KEY_LENGTH, E_INVALID_ATTRIBUTE);
            assert!(string::length(&attr.value) > 0, E_INVALID_ATTRIBUTE);
            assert!(string::length(&attr.value) <= MAX_ATTRIBUTE_VALUE_LENGTH, E_INVALID_ATTRIBUTE);
            i = i + 1;
        };
    }

    fun validate_required_string(s: &String, max_len: u64) {
        let len = string::length(s);
        assert!(len > 0, E_EMPTY_REQUIRED_STRING);
        assert!(len <= max_len, E_STRING_TOO_LONG);
    }

    fun validate_optional_string(s: &String, max_len: u64) {
        let len = string::length(s);
        assert!(len <= max_len, E_STRING_TOO_LONG);
    }

    fun validate_required_uri(s: &String) {
        let len = string::length(s);
        assert!(len > 0, E_EMPTY_REQUIRED_URI);
        assert!(len <= MAX_URI_LENGTH, E_URI_TOO_LONG);
    }

    fun validate_optional_uri(s: &String) {
        let len = string::length(s);
        assert!(len <= MAX_URI_LENGTH, E_URI_TOO_LONG);
    }

    fun validate_base_stat_value(v: u64) {
        assert!(v <= MAX_BASE_STAT_VALUE, E_STAT_CAP_EXCEEDED);
    }

    fun validate_effective_stat_value(v: u64) {
        assert!(v <= MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED);
    }

    fun add_with_cap(a: u64, b: u64, cap: u64, err: u64): u64 {
        assert!(a <= cap, err);
        assert!(b <= cap, err);
        assert!(a <= cap - b, err);
        a + b
    }

    fun valid_frame_type(v: u8): bool { v == FRAME_MASCULINE || v == FRAME_FEMININE }

    fun valid_skin_tone(v: u8): bool {
        v == SKIN_LIGHT_PEACH || v == SKIN_PEACH || v == SKIN_PEACH_BROWN || v == SKIN_BROWN || v == SKIN_DARK_BROWN
    }

    fun valid_hair_type(v: u8): bool {
        v == HAIR_BALD || v == HAIR_SHORT || v == HAIR_LONG || v == HAIR_CURLY || v == HAIR_BRAIDS ||
        v == HAIR_LOCS || v == HAIR_PONYTAIL || v == HAIR_BUZZ || v == HAIR_WAVY
    }

    fun valid_hair_color(v: u8): bool {
        v == HAIR_BLACK || v == HAIR_DARK_BROWN || v == HAIR_BROWN || v == HAIR_LIGHT_BROWN ||
        v == HAIR_BLONDE || v == HAIR_RED || v == HAIR_GRAY || v == HAIR_WHITE_SILVER ||
        v == HAIR_BLUE || v == HAIR_PINK
    }

    fun valid_height_class(v: u8): bool {
        v == HEIGHT_SHORT || v == HEIGHT_AVERAGE || v == HEIGHT_TALL
    }

    fun valid_body_type(v: u8): bool {
        v == BODY_SLIM || v == BODY_ATHLETIC || v == BODY_HEAVY
    }

    fun valid_face_style(v: u8): bool {
        v == FACE_1 || v == FACE_2 || v == FACE_3 || v == FACE_4 || v == FACE_5 || v == FACE_6
    }

    fun valid_eye_color(v: u8): bool {
        v == EYES_BROWN || v == EYES_DARK_BROWN || v == EYES_HAZEL || v == EYES_BLUE || v == EYES_GREEN || v == EYES_GRAY
    }

    fun valid_eye_style(v: u8): bool {
        v == EYE_STYLE_ROUND || v == EYE_STYLE_ALMOND || v == EYE_STYLE_SHARP ||
        v == EYE_STYLE_SOFT || v == EYE_STYLE_SLEEPY || v == EYE_STYLE_WIDE
    }

    fun valid_mouth_style(v: u8): bool {
        v == MOUTH_STYLE_NEUTRAL || v == MOUTH_STYLE_SOFT_SMILE || v == MOUTH_STYLE_FULL ||
        v == MOUTH_STYLE_THIN || v == MOUTH_STYLE_DEFINED || v == MOUTH_STYLE_YOUTHFUL
    }

    fun valid_facial_hair(v: u8): bool {
        v == FACIAL_NONE || v == FACIAL_MUSTACHE || v == FACIAL_GOATEE || v == FACIAL_SHORT_BEARD || v == FACIAL_FULL_BEARD
    }

    fun valid_expression_profile(v: u8): bool {
        v == EXPRESSION_CALM || v == EXPRESSION_CONFIDENT || v == EXPRESSION_PLAYFUL ||
        v == EXPRESSION_SERIOUS || v == EXPRESSION_AGGRESSIVE || v == EXPRESSION_SHY
    }

    fun valid_voice_type(v: u8): bool {
        v == VOICE_CALM || v == VOICE_ENERGETIC || v == VOICE_DEEP || v == VOICE_PLAYFUL || v == VOICE_ROBOTIC || v == VOICE_MYSTERIOUS
    }

    fun valid_style_type(v: u8): bool {
        v == STYLE_STREET || v == STYLE_TACTICAL || v == STYLE_LUXURY || v == STYLE_SPORTY || v == STYLE_FUTURISTIC || v == STYLE_CASUAL
    }

    fun valid_idle_style(v: u8): bool {
        v == IDLE_RELAXED || v == IDLE_ALERT || v == IDLE_TOUGH || v == IDLE_HEROIC || v == IDLE_SNEAKY
    }

    fun valid_walk_style(v: u8): bool {
        v == WALK_NORMAL || v == WALK_SWAGGER || v == WALK_STEALTH || v == WALK_HEAVY || v == WALK_CONFIDENT
    }

    fun valid_emote_pack(v: u8): bool {
        v == EMOTE_BASIC || v == EMOTE_FUN || v == EMOTE_FIGHTER || v == EMOTE_HERO || v == EMOTE_VILLAIN
    }

    fun valid_item_category(v: u8): bool {
        v == ITEM_CATEGORY_CLOTHING || v == ITEM_CATEGORY_PROP || v == ITEM_CATEGORY_VEHICLE ||
        v == ITEM_CATEGORY_PET || v == ITEM_CATEGORY_AURA || v == ITEM_CATEGORY_TOOL ||
        v == ITEM_CATEGORY_EMOTE_PACK || v == ITEM_CATEGORY_VOICE_PACK
    }

    fun valid_interaction_type(v: u8): bool {
        v == INTERACTION_NONE || v == INTERACTION_DRINK || v == INTERACTION_EAT ||
        v == INTERACTION_PHONE || v == INTERACTION_DRIVE_CAR || v == INTERACTION_RIDE_MOTORCYCLE ||
        v == INTERACTION_RIDE_BICYCLE || v == INTERACTION_PET || v == INTERACTION_DANCE ||
        v == INTERACTION_INSPECT
    }

    fun valid_hold_anchor(v: u8): bool {
        v == HOLD_NONE || v == HOLD_LEFT_HAND || v == HOLD_RIGHT_HAND ||
        v == HOLD_BOTH_HANDS || v == HOLD_BACK_MOUNT || v == HOLD_VEHICLE_SEAT
    }

    fun valid_slot(slot: u8): bool {
        slot == SLOT_HEAD ||
        slot == SLOT_FACE ||
        slot == SLOT_NECK ||
        slot == SLOT_UPPER_BODY ||
        slot == SLOT_LOWER_BODY ||
        slot == SLOT_FEET ||
        slot == SLOT_WRIST_LEFT ||
        slot == SLOT_WRIST_RIGHT ||
        slot == SLOT_HAND_LEFT ||
        slot == SLOT_HAND_RIGHT ||
        slot == SLOT_BACK ||
        slot == SLOT_SKIN_HEAD ||
        slot == SLOT_SKIN_UPPER ||
        slot == SLOT_SKIN_LOWER ||
        slot == SLOT_PET ||
        slot == SLOT_VEHICLE ||
        slot == SLOT_AURA ||
        slot == SLOT_EMOTE ||
        slot == SLOT_VOICE
    }

    fun slot_accepts_category(slot: u8, category: u8): bool {
        if (category == ITEM_CATEGORY_CLOTHING) {
            slot == SLOT_HEAD ||
            slot == SLOT_FACE ||
            slot == SLOT_NECK ||
            slot == SLOT_UPPER_BODY ||
            slot == SLOT_LOWER_BODY ||
            slot == SLOT_FEET ||
            slot == SLOT_WRIST_LEFT ||
            slot == SLOT_WRIST_RIGHT ||
            slot == SLOT_HAND_LEFT ||
            slot == SLOT_HAND_RIGHT ||
            slot == SLOT_BACK ||
            slot == SLOT_SKIN_HEAD ||
            slot == SLOT_SKIN_UPPER ||
            slot == SLOT_SKIN_LOWER
        } else if (category == ITEM_CATEGORY_PROP || category == ITEM_CATEGORY_TOOL) {
            slot == SLOT_HAND_LEFT || slot == SLOT_HAND_RIGHT || slot == SLOT_BACK
        } else if (category == ITEM_CATEGORY_VEHICLE) {
            slot == SLOT_VEHICLE
        } else if (category == ITEM_CATEGORY_PET) {
            slot == SLOT_PET
        } else if (category == ITEM_CATEGORY_AURA) {
            slot == SLOT_AURA
        } else if (category == ITEM_CATEGORY_EMOTE_PACK) {
            slot == SLOT_EMOTE
        } else if (category == ITEM_CATEGORY_VOICE_PACK) {
            slot == SLOT_VOICE
        } else {
            false
        }
    }

    fun interaction_compatible_with_category(category: u8, interaction_type: u8): bool {
        if (
            category == ITEM_CATEGORY_CLOTHING ||
            category == ITEM_CATEGORY_AURA ||
            category == ITEM_CATEGORY_EMOTE_PACK ||
            category == ITEM_CATEGORY_VOICE_PACK
        ) {
            interaction_type == INTERACTION_NONE
        } else if (category == ITEM_CATEGORY_PROP || category == ITEM_CATEGORY_TOOL) {
            interaction_type == INTERACTION_NONE ||
            interaction_type == INTERACTION_DRINK ||
            interaction_type == INTERACTION_EAT ||
            interaction_type == INTERACTION_PHONE ||
            interaction_type == INTERACTION_DANCE ||
            interaction_type == INTERACTION_INSPECT
        } else if (category == ITEM_CATEGORY_VEHICLE) {
            interaction_type == INTERACTION_DRIVE_CAR ||
            interaction_type == INTERACTION_RIDE_MOTORCYCLE ||
            interaction_type == INTERACTION_RIDE_BICYCLE
        } else if (category == ITEM_CATEGORY_PET) {
            interaction_type == INTERACTION_NONE || interaction_type == INTERACTION_PET
        } else {
            false
        }
    }

    fun hold_anchor_compatible_with_slot(slot: u8, hold_anchor: u8): bool {
        if (slot == SLOT_HAND_LEFT) {
            hold_anchor == HOLD_NONE || hold_anchor == HOLD_LEFT_HAND || hold_anchor == HOLD_BOTH_HANDS
        } else if (slot == SLOT_HAND_RIGHT) {
            hold_anchor == HOLD_NONE || hold_anchor == HOLD_RIGHT_HAND || hold_anchor == HOLD_BOTH_HANDS
        } else if (slot == SLOT_BACK) {
            hold_anchor == HOLD_NONE || hold_anchor == HOLD_BACK_MOUNT
        } else if (slot == SLOT_VEHICLE) {
            hold_anchor == HOLD_NONE || hold_anchor == HOLD_VEHICLE_SEAT
        } else {
            hold_anchor == HOLD_NONE
        }
    }

    fun attachment_configuration_is_valid(
        slot: u8,
        category: u8,
        interaction_type: u8,
        hold_anchor: u8
    ): bool {
        slot_accepts_category(slot, category) &&
        interaction_compatible_with_category(category, interaction_type) &&
        hold_anchor_compatible_with_slot(slot, hold_anchor)
    }

    fun other_hand_slot(slot: u8): u8 {
        if (slot == SLOT_HAND_LEFT) {
            SLOT_HAND_RIGHT
        } else {
            SLOT_HAND_LEFT
        }
    }

    fun remove_slot_if_present(
        avatar: &mut Avatar,
        slot: u8,
        owner: address,
        avatar_id: ID
    ) {
        if (dof::exists_<u8>(&avatar.id, slot)) {
            let item = dof::remove<u8, Attachment>(&mut avatar.id, slot);
            let attachment_id = object::id(&item);
            transfer::public_transfer(item, owner);
            event::emit(Unequipped {
                avatar_id,
                attachment_id,
                owner,
                slot,
            });
        };
    }

    // ============================================================
    // Stats helpers
    // ============================================================
    fun starter_stats(): StatBlock {
        StatBlock {
            stamina: 10,
            shooting: 10,
            strength: 10,
            stealth: 10,
            flying: 10,
            driving: 10,
            lung_capacity: 10,
        }
    }

    fun zero_stats(): StatBlock {
        StatBlock {
            stamina: 0,
            shooting: 0,
            strength: 0,
            stealth: 0,
            flying: 0,
            driving: 0,
            lung_capacity: 0,
        }
    }

    fun add_stats(a: &StatBlock, b: &StatBlock): StatBlock {
        StatBlock {
            stamina: add_with_cap(a.stamina, b.stamina, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
            shooting: add_with_cap(a.shooting, b.shooting, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
            strength: add_with_cap(a.strength, b.strength, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
            stealth: add_with_cap(a.stealth, b.stealth, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
            flying: add_with_cap(a.flying, b.flying, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
            driving: add_with_cap(a.driving, b.driving, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
            lung_capacity: add_with_cap(a.lung_capacity, b.lung_capacity, MAX_EFFECTIVE_STAT_VALUE, E_STAT_CAP_EXCEEDED),
        }
    }

    fun slot_bonus(avatar: &Avatar, slot: u8): StatBlock {
        if (dof::exists_<u8>(&avatar.id, slot)) {
            dof::borrow<u8, Attachment>(&avatar.id, slot).bonus_stats
        } else {
            zero_stats()
        }
    }

    fun compute_total_stats(avatar: &Avatar): StatBlock {
        let s0 = add_stats(&avatar.base_stats, &slot_bonus(avatar, SLOT_HEAD));
        let s1 = add_stats(&s0, &slot_bonus(avatar, SLOT_FACE));
        let s2 = add_stats(&s1, &slot_bonus(avatar, SLOT_NECK));
        let s3 = add_stats(&s2, &slot_bonus(avatar, SLOT_UPPER_BODY));
        let s4 = add_stats(&s3, &slot_bonus(avatar, SLOT_LOWER_BODY));
        let s5 = add_stats(&s4, &slot_bonus(avatar, SLOT_FEET));
        let s6 = add_stats(&s5, &slot_bonus(avatar, SLOT_WRIST_LEFT));
        let s7 = add_stats(&s6, &slot_bonus(avatar, SLOT_WRIST_RIGHT));
        let s8 = add_stats(&s7, &slot_bonus(avatar, SLOT_HAND_LEFT));
        let s9 = add_stats(&s8, &slot_bonus(avatar, SLOT_HAND_RIGHT));
        let s10 = add_stats(&s9, &slot_bonus(avatar, SLOT_BACK));
        let s11 = add_stats(&s10, &slot_bonus(avatar, SLOT_SKIN_HEAD));
        let s12 = add_stats(&s11, &slot_bonus(avatar, SLOT_SKIN_UPPER));
        let s13 = add_stats(&s12, &slot_bonus(avatar, SLOT_SKIN_LOWER));
        let s14 = add_stats(&s13, &slot_bonus(avatar, SLOT_PET));
        let s15 = add_stats(&s14, &slot_bonus(avatar, SLOT_VEHICLE));
        let s16 = add_stats(&s15, &slot_bonus(avatar, SLOT_AURA));
        let s17 = add_stats(&s16, &slot_bonus(avatar, SLOT_EMOTE));
        add_stats(&s17, &slot_bonus(avatar, SLOT_VOICE))
    }

    fun recompute_effective_stats(avatar: &mut Avatar) {
        let totals = compute_total_stats(avatar);
        avatar.effective_stats = totals;
    }

    fun emit_stats_updated(avatar: &Avatar) {
        let e = avatar.effective_stats;
        event::emit(StatsUpdated {
            avatar_id: object::id(avatar),
            level: avatar.level,
            xp: avatar.xp,
            unspent_stat_points: avatar.unspent_stat_points,
            stamina: e.stamina,
            shooting: e.shooting,
            strength: e.strength,
            stealth: e.stealth,
            flying: e.flying,
            driving: e.driving,
            lung_capacity: e.lung_capacity,
        });
    }

    // ============================================================
    // Read helpers
    // ============================================================
    public fun mint_price(config: &MintConfig): u64 { config.mint_price_mist }
    public fun mint_is_enabled(config: &MintConfig): bool { config.mint_enabled }
    public fun treasury_balance(config: &MintConfig): u64 { balance::value(&config.treasury) }

    public fun has_attachment(avatar: &Avatar, slot: u8): bool {
        assert!(valid_slot(slot), E_INVALID_SLOT);
        dof::exists_<u8>(&avatar.id, slot)
    }

    public fun attachment_id(avatar: &Avatar, slot: u8): Option<ID> {
        assert!(valid_slot(slot), E_INVALID_SLOT);
        dof::id<u8>(&avatar.id, slot)
    }

    public fun name_of(avatar: &Avatar): &String { &avatar.name }
    public fun description_of(avatar: &Avatar): &String { &avatar.description }
    public fun image_url_of(avatar: &Avatar): &String { &avatar.image_url }
    public fun base_model_uri_of(avatar: &Avatar): &String { &avatar.base_model_uri }
    public fun portrait_uri_of(avatar: &Avatar): &String { &avatar.portrait_uri }
    public fun attributes_of(avatar: &Avatar): &vector<Attribute> { &avatar.attributes }

    public fun appearance_of(avatar: &Avatar): Appearance { avatar.appearance }
    public fun behavior_of(avatar: &Avatar): BehaviorProfile { avatar.behavior }
    public fun base_stats_of(avatar: &Avatar): StatBlock { avatar.base_stats }
    public fun effective_stats_of(avatar: &Avatar): StatBlock { avatar.effective_stats }
    public fun unspent_stat_points_of(avatar: &Avatar): u64 { avatar.unspent_stat_points }

    public fun total_stats(avatar: &Avatar): StatBlock { avatar.effective_stats }
    public fun total_stamina(avatar: &Avatar): u64 { avatar.effective_stats.stamina }
    public fun total_shooting(avatar: &Avatar): u64 { avatar.effective_stats.shooting }
    public fun total_strength(avatar: &Avatar): u64 { avatar.effective_stats.strength }
    public fun total_stealth(avatar: &Avatar): u64 { avatar.effective_stats.stealth }
    public fun total_flying(avatar: &Avatar): u64 { avatar.effective_stats.flying }
    public fun total_driving(avatar: &Avatar): u64 { avatar.effective_stats.driving }
    public fun total_lung_capacity(avatar: &Avatar): u64 { avatar.effective_stats.lung_capacity }
}
