# chatbees-chat-widget
The demo popup chat widget. Customize it for your need.

[Signup](https://www.chatbees.ai) to create a private account. Or you could also try it out in ChatBees public account without signup. Note: the collections in the public account are subject to permanent deletion after 2 weeks.

Create an API key in your account or the public account. Then you can [create a collection](https://docs.chatbees.ai/chatbees/api-references/collection-operations/create-collection) using the API key. You can directly send a REST request, or install and use ChatBees python client, ```pip3 install chatbees-python-client```.
```
POST /collections/create HTTP/1.1
Api-Key: my_api_key
Content-Type: application/json
Host: my_account_id.us-west-2.aws.chatbees.ai
# for public account, replace my_account_id with public

{
  "namespace_name": "string",
  "collection_name": "string",
  // description is Optional
  "description": "string" or null,
  // Optional, whether the collection is publicly readable
  "public_read": bool or null,
}
```
                                                               
Please replace the ```chatbeesAccountID``` and ```chatbeesCollectionName``` with your account id and collection name in ```chatbees_demo.html```. If the chat widget is used privately, please add your API key to the rest request in ```chatbees_script.js```. The public_read collection answers questions without an API key. 

For any question, please feel free to create an issue in this repository or email us at build@chatbees.ai.
