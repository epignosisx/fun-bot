import * as express from "express";

declare namespace actionsOnGoogleeee {

    /**
     * Constructor for Assistant object.
     * Should not be instantiated; rather instantiate one of the subclasses
     * {@link ActionsSdkAssistant} or {@link ApiAiAssistant}.
     *
     * @param {Object} options JSON configuration: {request [Express HTTP request object],
                     response [Express HTTP response object], sessionStarted [function]}
    * @constructor
    */
    export class Assistant {

        constructor (options: {request: express.Request; response: express.Response});

        /**
         * The session state.
         * @public {string}
         */
        state:string;
        /**
         * The session data in JSON format.
         * @public {object}
         */
        data: {};

        /**
         * List of standard intents that the Assistant provides.
         * @readonly
         * @enum {string}
         * @actionssdk
         * @apiai
         */
        StandardIntents: {
            /** Assistant fires MAIN intent for queries like [talk to $action]. */
            MAIN: string;
            /** Assistant fires TEXT intent when action issues ask intent. */
            TEXT: string;
            /** Assistant fires PERMISSION intent when action invokes askForPermission. */
            PERMISSION: string;
        };

        /**
         * List of supported permissions the Assistant supports.
         * @readonly
         * @enum {string}
         * @actionssdk
         * @apiai
         */
        SupportedPermissions: {
            /**
             * The user's name as defined in the
             * {@link https://developers.google.com/actions/reference/conversation#UserProfile|UserProfile object}
             */
            NAME: string;
            /**
             * The location of the user's current device, as defined in the
             * {@link https://developers.google.com/actions/reference/conversation#Location|Location object}.
             */
            DEVICE_PRECISE_LOCATION: string;
            /**
             * City and zipcode corresponding to the location of the user's current device, as defined in the
             * {@link https://developers.google.com/actions/reference/conversation#Location|Location object}.
             */
            DEVICE_COARSE_LOCATION: string;
        };

        /**
         * List of built-in argument names.
         * @readonly
         * @enum {string}
         * @actionssdk
         * @apiai
         */
        BuiltInArgNames: {
            /** Permission granted argument. */
            PERMISSION_GRANTED: string;
        };

        /**
         * Handles the incoming Assistant request using a handler or Map of handlers.
         * Each handler can be a function callback or Promise.
         *
         * @example
         * // Actions SDK
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         *
         * function mainIntent (assistant) {
         *   const inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
         *         'I can read out an ordinal like ' +
         *         '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
         *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
         *   assistant.ask(inputPrompt);
         * }
         *
         * function rawInput (assistant) {
         *   if (assistant.getRawInput() === 'bye') {
         *     assistant.tell('Goodbye!');
         *   } else {
         *     const inputPrompt = assistant.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
         *       assistant.getRawInput() + '</say-as></speak>',
         *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
         *     assistant.ask(inputPrompt);
         *   }
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
         * actionMap.set(assistant.StandardIntents.TEXT, rawInput);
         *
         * assistant.handleRequest(actionMap);
         *
         * // API.AI
         * const assistant = new ApiAiAssistant({request: req, response: res});
         * const NAME_ACTION = 'make_name';
         * const COLOR_ARGUMENT = 'color';
         * const NUMBER_ARGUMENT = 'number';
         *
         * function makeName (assistant) {
         *   const number = assistant.getArgument(NUMBER_ARGUMENT);
         *   const color = assistant.getArgument(COLOR_ARGUMENT);
         *   assistant.tell('Alright, your silly name is ' +
         *     color + ' ' + number +
         *     '! I hope you like it. See you next time.');
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(NAME_ACTION, makeName);
         * assistant.handleRequest(actionMap);
         *
         * @param {Object} handler The handler for the request.
         * @actionssdk
         * @apiai
         */
        handleRequest(handler: Function | Map<string, (assistant: ApiAiAssistant) => void>): void;

        /**
         * Equivalent to {@link Assistant#askForPermission}, but allows you to prompt the
         * user for more than one permission at once.
         *
         * Notes:
         *
         * * The order in which you specify the permission prompts does not matter -
         *   it is controlled by the assistant to provide a consistent user experience.
         * * The user will be able to either accept all permissions at once, or none.
         *   If you wish to allow them to selectively accept one or other, make several
         *   dialog turns asking for each permission independently with askForPermission.
         * * Asking for DEVICE_COARSE_LOCATION and DEVICE_PRECISE_LOCATION at once is
         *   equivalent to just asking for DEVICE_PRECISE_LOCATION
         *
         * @example
         * const assistant = new ApiAiAssistant({request: req, response: res});
         * const REQUEST_PERMISSION_ACTION = 'request_permission';
         * const GET_RIDE_ACTION = 'get_ride';
         *
         * function requestPermission (assistant) {
         *   const permission = [
         *     assistant.SupportedPermissions.NAME,
         *     assistant.SupportedPermissions.DEVICE_PRECISE_LOCATION
         *   ];
         *   assistant.askForPermissions('To pick you up', permissions);
         * }
         *
         * function sendRide (assistant) {
         *   if (assistant.isPermissionGranted()) {
         *     const displayName = assistant.getUserName().displayName;
         *     const address = assistant.getDeviceLocation().address;
         *     assistant.tell('I will tell your driver to pick up ' + displayName +
         *         ' at ' + address);
         *   } else {
         *     // Response shows that user did not grant permission
         *     assistant.tell('Sorry, I could not figure out where to pick you up.');
         *   }
         * }
         * const actionMap = new Map();
         * actionMap.set(REQUEST_PERMISSION_ACTION, requestPermission);
         * actionMap.set(GET_RIDE_ACTION, sendRide);
         * assistant.handleRequest(actionMap);
         *
         * @param {string} context Context why the permission is being asked; it's the TTS
         *                 prompt prefix (action phrase) we ask the user.
         * @param {Array} permissions Array of permissions Assistant supports, each of
         *                which comes from Assistant.SupportedPermissions.
         * @param {Object=} dialogState JSON object the action uses to hold dialog state that
         *                 will be circulated back by Assistant.
         *
         * @return A response is sent to Assistant to ask for the user's permission; for any
         *         invalid input, we return null.
         * @actionssdk
         * @apiai
         */
        askForPermissions(context: string, permissions: string[], dialogState: {}): express.Response;

        /**
         * Asks the Assistant to guide the user to grant a permission. For example,
         * if you want your action to get access to the user's name, you would invoke
         * the askForPermission method with a context containing the reason for the request,
         * and the assistant.SupportedPermissions.NAME permission. With this, the Assistant will ask
         * the user, in your agent's voice, the following: '[Context with reason for the request],
         * I'll just need to get your name from Google, is that OK?'.
         *
         * Once the user accepts or denies the request, the Assistant will fire another intent:
         * assistant.intent.action.PERMISSION with a boolean argument: assistant.BuiltInArgNames.PERMISSION_GRANTED
         * and, if granted, the information that you requested.
         *
         * Read more:
         *
         * * {@link https://developers.google.com/actions/reference/conversation#ExpectedIntent|Supported Permissions}
         * * Check if the permission has been granted with {@link ActionsSdkAssistant#isPermissionGranted}
         * * {@link ActionsSdkAssistant#getDeviceLocation}
         * * {@link Assistant#getUserName}
         *
         * @example
         * const assistant = new ApiAiAssistant({request: req, response: res});
         * const REQUEST_PERMISSION_ACTION = 'request_permission';
         * const GET_RIDE_ACTION = 'get_ride';
         *
         * function requestPermission (assistant) {
         *   const permission = assistant.SupportedPermissions.NAME;
         *   assistant.askForPermission('To pick you up', permission);
         * }
         *
         * function sendRide (assistant) {
         *   if (assistant.isPermissionGranted()) {
         *     const displayName = assistant.getUserName().displayName;
         *     assistant.tell('I will tell your driver to pick up ' + displayName);
         *   } else {
         *     // Response shows that user did not grant permission
         *     assistant.tell('Sorry, I could not figure out who to pick up.');
         *   }
         * }
         * const actionMap = new Map();
         * actionMap.set(REQUEST_PERMISSION_ACTION, requestPermission);
         * actionMap.set(GET_RIDE_ACTION, sendRide);
         * assistant.handleRequest(actionMap);
         *
         * @param {string} context Context why permission is asked; it's the TTS
         *                 prompt prefix (action phrase) we ask the user.
         * @param {string} permission One of the permissions Assistant supports, each of
         *                 which comes from Assistant.SupportedPermissions.
         * @param {Object=} dialogState JSON object the action uses to hold dialog state that
         *                 will be circulated back by Assistant.
         *
         * @return A response is sent to the Assistant to ask for the user's permission;
         *         for any invalid input, we return null.
         * @actionssdk
         * @apiai
         */
        askForPermission(context: string, permission: string, dialogState: {}): express.Response;

        /**
         * If granted permission to user's name in previous intent, returns user's
         * display name, family name, and given name. If name info is unavailable,
         * returns null.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: req, response: res});
         * const REQUEST_PERMISSION_ACTION = 'request_permission';
         * const SAY_NAME_ACTION = 'get_name';
         *
         * function requestPermission (assistant) {
         *   const permission = assistant.SupportedPermissions.NAME;
         *   assistant.askForPermission('To know who you are', permission);
         * }
         *
         * function sayName (assistant) {
         *   if (assistant.isPermissionGranted()) {
         *     assistant.tell('Your name is ' + assistant.getUserName().displayName));
         *   } else {
         *     // Response shows that user did not grant permission
         *     assistant.tell('Sorry, I could not get your name.');
         *   }
         * }
         * const actionMap = new Map();
         * actionMap.set(REQUEST_PERMISSION_ACTION, requestPermission);
         * actionMap.set(SAY_NAME_ACTION, sayName);
         * assistant.handleRequest(actionMap);
         *
         * @return {UserName} Null if name permission is not granted.
         * @actionssdk
         * @apiai
         */
        getUserName(): { displayName: string; givenName: string; familyName: string };
    }

    export interface DeviceLocation {
        coordinates: {latitude: number; longitude: number;};
        address: string;
        city: string;
        zipCode: string;
    }

    export interface UserProfile {
        given_name: string;
        family_name: string;
        display_name: string;
    }

    export interface User {
        user_id: string;
        profile: UserProfile;
        access_token: string;
    }

    /**
     * Constructor for ApiAiAssistant object. To be used in the API.AI
     * fulfillment webhook logic.
     *
     * @example
     * const ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
     * const assistant = new ApiAiAssistant({request: request, response: response,
     *   sessionStarted:sessionStarted});
     *
     * @param {Object} options JSON configuration: {request [Express HTTP request object],
                     response [Express HTTP response object], sessionStarted [function]}
    * @constructor
    * @apiai
    */
    export class ApiAiAssistant extends Assistant {
        constructor(options: {});

        /**
         * Gets the {@link https://developers.google.com/actions/reference/conversation#User|User object}.
         * The user object contains information about the user, including
         * a string identifier and personal information (requires requesting permissions,
         * see {@link Assistant#askForPermissions}).
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * const userId = assistant.getUser().user_id;
         *
         * @return {Object} {@link https://developers.google.com/actions/reference/conversation#User|User info}
         *                  or null if no value.
         * @apiai
         */
        getUser(): User;

        /**
         * If granted permission to device's location in previous intent, returns device's
         * location (see {@link Assistant#askForPermissions}). If device info is unavailable,
         * returns null.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: req, response: res});
         * assistant.askForPermission("To get you a ride",
         *   assistant.SupportedPermissions.DEVICE_PRECISE_LOCATION);
         * // ...
         * // In response handler for permissions fallback intent:
         * if (assistant.isPermissionGranted()) {
         *   sendCarTo(assistant.getDeviceLocation().coordinates);
         * }
         *
         * @return {DeviceLocation} Null if location permission is not granted.
         * @apiai
         */
        getDeviceLocation() : {coordinates: {}, address: string; zipCode: string; city: string;};

        /**
         * Returns true if the request follows a previous request asking for
         * permission from the user and the user granted the permission(s). Otherwise,
         * false. Use with {@link Assistant#askForPermissions}.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * assistant.askForPermissions("To get you a ride", [
         *   assistant.SupportedPermissions.NAME,
         *   assistant.SupportedPermissions.DEVICE_PRECISE_LOCATION
         * ]);
         * // ...
         * // In response handler for permissions fallback intent:
         * if (assistant.isPermissionGranted()) {
         *  // Use the requested permission(s) to get the user a ride
         * }
         *
         * @return {boolean} true if permissions granted.
         * @apiai
         */
        isPermissionGranted(): boolean;

        /**
         * Verifies whether the request comes from API.AI.
         *
         * @param {string} key The header key specified by the developer in the
         *                 API.AI Fulfillment settings of the action.
         * @param {string} value The private value specified by the developer inside the
         *                 fulfillment header.
         * @return {boolean} true if the request comes from API.AI.
         * @apiai
         */
        isRequestFromApiAi(key: string, value: string): boolean;

        /**
         * Get the current intent. Alternatively, using a handler Map with {@link Assistant#handleRequest},
         * the client library will automatically handle the incoming intents.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         *
         * function responseHandler (assistant) {
         *   const intent = assistant.getIntent();
         *   switch (intent) {
         *     case WELCOME_INTENT:
         *       assistant.ask('Welcome to action snippets! Say a number.');
         *       break;
         *
         *     case NUMBER_INTENT:
         *       const number = assistant.getArgument(NUMBER_ARGUMENT);
         *       assistant.tell('You said ' + number);
         *       break;
         *   }
         * }
         *
         * assistant.handleRequest(responseHandler);
         *
         * @return {string} Intent id or null if no value.
         * @apiai
         */      
        getIntent(): string;

        /**
         * Get the argument value by name from the current intent.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * const WELCOME_INTENT = 'input.welcome';
         * const NUMBER_INTENT = 'input.number';
         *
         * function welcomeIntent (assistant) {
         *   assistant.ask('Welcome to action snippets! Say a number.');
         * }
         *
         * function numberIntent (assistant) {
         *   const number = assistant.getArgument(NUMBER_ARGUMENT);
         *   assistant.tell('You said ' + number);
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(WELCOME_INTENT, welcomeIntent);
         * actionMap.set(NUMBER_INTENT, numberIntent);
         * assistant.handleRequest(actionMap);
         *
         * @param {string} argName Name of the argument.
         * @return {object} Argument value matching argName
                             or null if no matching argument.
        * @apiai
        */
        getArgument (argName: string): string;

        /**
         * Asks Assistant to collect the user's input.
         *
         * NOTE: Due to a bug, if you specify the no-input prompts,
         * the mic is closed after the 3rd prompt, so you should use the 3rd prompt
         * for a bye message until the bug is fixed.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * const WELCOME_INTENT = 'input.welcome';
         * const NUMBER_INTENT = 'input.number';
         *
         * function welcomeIntent (assistant) {
         *   assistant.ask('Welcome to action snippets! Say a number.',
         *     ['Say any number', 'Pick a number', 'What is the number?']);
         * }
         *
         * function numberIntent (assistant) {
         *   const number = assistant.getArgument(NUMBER_ARGUMENT);
         *   assistant.tell('You said ' + number);
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(WELCOME_INTENT, welcomeIntent);
         * actionMap.set(NUMBER_INTENT, numberIntent);
         * assistant.handleRequest(actionMap);
         *
         * @param {String} inputPrompt The input prompt text.
         * @param {array} noInputs Array of re-prompts when the user does not respond (max 3).
         * @return {Object} HTTP response.
         * @apiai
         */     
        ask (inputPrompt: string, noInputs: string): express.Request;

        /**
         * Tells the Assistant to render the speech response and close the mic.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * const WELCOME_INTENT = 'input.welcome';
         * const NUMBER_INTENT = 'input.number';
         *
         * function welcomeIntent (assistant) {
         *   assistant.ask('Welcome to action snippets! Say a number.');
         * }
         *
         * function numberIntent (assistant) {
         *   const number = assistant.getArgument(NUMBER_ARGUMENT);
         *   assistant.tell('You said ' + number);
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(WELCOME_INTENT, welcomeIntent);
         * actionMap.set(NUMBER_INTENT, numberIntent);
         * assistant.handleRequest(actionMap);
         *
         * @param {string} textToSpeech Final spoken response. Spoken response can be SSML.
         * @return The response that is sent back to Assistant.
         * @apiai
         */        
        tell (speechResponse: string): express.Request;


        /**
         * Set a new context for the current intent.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * const CONTEXT_NUMBER = 'number';
         *
         * function welcomeIntent (assistant) {
         *   assistant.setContext(CONTEXT_NUMBER);
         *   assistant.ask('Welcome to action snippets! Say a number.');
         * }
         *
         * function numberIntent (assistant) {
         *   const number = assistant.getArgument(NUMBER_ARGUMENT);
         *   assistant.tell('You said ' + number);
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(WELCOME_INTENT, welcomeIntent);
         * actionMap.set(NUMBER_INTENT, numberIntent);
         * assistant.handleRequest(actionMap);
         *
         * @param {string} context Name of the context.
         * @param {int} lifespan Context lifespan.
         * @param {object} parameters Context JSON parameters.
         * @apiai
         */
        setContext (context: string, lifespan: number, parameters: {}): void;

        /**
         * Gets the user's raw input query.
         *
         * @example
         * const assistant = new ApiAiAssistant({request: request, response: response});
         * assistant.tell('You said ' + assistant.getRawInput());
         *
         * @return {string} User's raw query or null if no value.
         * @apiai
         */
        getRawInput (): string;
    }

    export class State {
        constructor(name: string);

        getName(): string;
    }

    /**
     * Constructor for ActionsSdkAssistant object. To be used in the Actions SDK
     * HTTP endpoint logic.
     *
     * @example
     * const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
     * const assistant = new ActionsSdkAssistant({request: request, response: response,
     *   sessionStarted:sessionStarted});
     *
     * @param {Object} options JSON configuration: {request [Express HTTP request object],
                     response [Express HTTP response object], sessionStarted [function]}
    * @constructor
    * @actionssdk
    */
    export class ActionsSdkAssistant extends Assistant {
        constructor (options: {request: express.Request; response: express.Response; sessionStarted: Function});

       /**
        * Gets the request Conversation API version.
        *
        * @example
        * const assistant = new ActionsSdkAssistant({request: request, response: response});
        * const apiVersion = assistant.getApiVersion();
        *
        * @return {string} Version value or null if no value.
        * @actionssdk
        */
        getApiVersion(): string;

        /**
         * Gets the user's raw input query.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         * assistant.tell('You said ' + assistant.getRawInput());
         *
         * @return {string} User's raw query or null if no value.
         * @actionssdk
         */
        getRawInput (): string;

        /**
         * Gets previous JSON dialog state that the action sent to Assistant.
         * Alternatively, use the assistant.data field to store JSON values between requests.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         * const dialogState = assistant.getDialogState();
         *
         * @return {Object} JSON object provided to the Assistant in the previous
         *                  user turn or {} if no value.
         * @actionssdk
         */
        getDialogState (): {};

        /**
         * Gets the {@link https://developers.google.com/actions/reference/conversation#User|User object}.
         * The user object contains information about the user, including
         * a string identifier and personal information (requires requesting permissions,
         * see {@link Assistant#askForPermissions}).
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         * const userId = assistant.getUser().user_id;
         *
         * @return {Object} {@link https://developers.google.com/actions/reference/conversation#User|User info}
         *                  or null if no value.
         * @actionssdk
         */
        getUser (): User;

        /**
         * If granted permission to device's location in previous intent, returns device's
         * location (see {@link Assistant#askForPermissions}). If device info is unavailable,
         * returns null.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: req, response: res});
         * assistant.askForPermission("To get you a ride",
         *   assistant.SupportedPermissions.DEVICE_PRECISE_LOCATION);
         * // ...
         * // In response handler for subsequent intent:
         * if (assistant.isPermissionGranted()) {
         *   sendCarTo(assistant.getDeviceLocation().coordinates);
         * }
         *
         * @return {DeviceLocation} Null if location permission is not granted.
         * @actionssdk
         */
        getDeviceLocation (): DeviceLocation;

        /**
         * Returns true if the request follows a previous request asking for
         * permission from the user and the user granted the permission(s). Otherwise,
         * false. Use with {@link Assistant#askForPermissions}.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         * assistant.askForPermissions("To get you a ride", [
         *   assistant.SupportedPermissions.NAME,
         *   assistant.SupportedPermissions.DEVICE_PRECISE_LOCATION
         * ]);
         * // ...
         * // In response handler for subsequent intent:
         * if (assistant.isPermissionGranted()) {
         *  // Use the requested permission(s) to get the user a ride
         * }
         *
         * @return {boolean} true if permissions granted.
         * @actionssdk
         */
        isPermissionGranted (): boolean;

        /**
         * Gets the "versionLabel" specified inside the Action Package.
         * Used by actions to do version control.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         * const actionVersionLabel = assistant.getActionVersionLabel();
         *
         * @return {string} The specified version label or null if unspecified.
         * @actionssdk
         */
        getActionVersionLabel(): string;

        /**
         * Gets the unique conversation ID. It's a new ID for the initial query,
         * and stays the same until the end of the conversation.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         * const conversationId = assistant.getConversationId();
         *
         * @return {string} Conversation ID or null if no value.
         * @actionssdk
         */
        getConversationId(): string;

        /**
         * Get the current intent. Alternatively, using a handler Map with {@link Assistant#handleRequest},
         * the client library will automatically handle the incoming intents.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         *
         * function responseHandler (assistant) {
         *   const intent = assistant.getIntent();
         *   switch (intent) {
         *     case assistant.StandardIntents.MAIN:
         *       const inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say anything.');
         *       assistant.ask(inputPrompt);
         *       break;
         *
         *     case assistant.StandardIntents.TEXT:
         *       assistant.tell('You said ' + assistant.getRawInput());
         *       break;
         *   }
         * }
         *
         * assistant.handleRequest(responseHandler);
         *
         * @return {string} Intent id or null if no value.
         * @actionssdk
         */
        getIntent (): string;

        /**
         * Get the argument value by name from the current intent.
         *
         * @param {string} argName Name of the argument.
         * @return {string} Argument value matching argName
         *                  or null if no matching argument.
         * @actionssdk
         */
        getArgument (argName: string): string;

        /**
         * Asks Assistant to collect user's input; all user's queries need to be sent to
         * the action.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         *
         * function mainIntent (assistant) {
         *   const inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
         *         'I can read out an ordinal like ' +
         *         '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
         *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
         *   assistant.ask(inputPrompt);
         * }
         *
         * function rawInput (assistant) {
         *   if (assistant.getRawInput() === 'bye') {
         *     assistant.tell('Goodbye!');
         *   } else {
         *     const inputPrompt = assistant.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
         *       assistant.getRawInput() + '</say-as></speak>',
         *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
         *     assistant.ask(inputPrompt);
         *   }
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
         * actionMap.set(assistant.StandardIntents.TEXT, rawInput);
         *
         * assistant.handleRequest(actionMap);
         *
         * @param {Object} inputPrompt Holding initial and no-input prompts.
         * @param {Object} dialogState JSON object the action uses to hold dialog state that
         *                 will be circulated back by Assistant.
         * @return The response that is sent to Assistant to ask user to provide input.
         * @actionssdk
         */
        ask (inputPrompt: string | {}, dialogState: {}): express.Response;

        /**
         * Tells Assistant to render the speech response and close the mic.
         *
         * @example
         * const assistant = new ActionsSdkAssistant({request: request, response: response});
         *
         * function mainIntent (assistant) {
         *   const inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
         *         'I can read out an ordinal like ' +
         *         '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
         *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
         *   assistant.ask(inputPrompt);
         * }
         *
         * function rawInput (assistant) {
         *   if (assistant.getRawInput() === 'bye') {
         *     assistant.tell('Goodbye!');
         *   } else {
         *     const inputPrompt = assistant.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
         *       assistant.getRawInput() + '</say-as></speak>',
         *         ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
         *     assistant.ask(inputPrompt);
         *   }
         * }
         *
         * const actionMap = new Map();
         * actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
         * actionMap.set(assistant.StandardIntents.TEXT, rawInput);
         *
         * assistant.handleRequest(actionMap);
         *
         * @param {string} textToSpeech Final spoken response. Spoken response can be SSML.
         * @return The HTTP response that is sent back to Assistant.
         * @actionssdk
         */
        tell (textToSpeech: string): express.Response;

        /**
         * Builds the {@link https://developers.google.com/actions/reference/conversation#InputPrompt|InputPrompt object}
         * from initial prompt and no-input prompts.
         *
         * The Assistant needs one initial prompt to start the conversation. If there is no user response,
         * the Assistant re-opens the mic and renders the no-input prompts three times
         * (one for each no-input prompt that was configured) to help the user
         * provide the right response.
         *
         * Note: we highly recommend action to provide all the prompts required here in order to ensure a
         * good user experience.
         *
         * @example
         * const inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say a number.',
         *     ['Say any number', 'Pick a number', 'What is the number?']);
         * assistant.ask(inputPrompt);
         *
         * @param {boolean} isSsml Indicates whether the text to speech is SSML or not.
         * @param {string} initialPrompt The initial prompt the Assistant asks the user.
         * @param {array} noInputs Array of re-prompts when the user does not respond (max 3).
         * @return {Object} An {@link https://developers.google.com/actions/reference/conversation#InputPrompt|InputPrompt object}.
         * @actionssdk
         */
        buildInputPrompt (isSsml: boolean, initialPrompt: string, noInputs: string[]): InputPrompt; 
    }

    export interface InputPrompt {
        /**
         * A single prompt that asks the user to provide an input.
         */
        initial_prompts: string[];

        /**
         * Up to three prompts that are used to re-ask the user when there is no input from user. 
         * For example, "I'm sorry, I didn't hear you. Can you repeat that please?"
         */
        no_input_prompts: string[];
    }
}

export = actionsOnGoogleeee;