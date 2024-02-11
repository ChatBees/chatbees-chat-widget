# chatbees-chat-widget
The demo popup chat widget. Customize it for your need.

Signup with your google account on https://www.chatbees.ai. You could also try it out in ChatBees public account without signup. Note: the collections in the public account are subject to permanent deletion after 2 weeks.

Create an API key in your account or the public account. Then you can create a collection using the API key. You can directly send a REST request, or install and use ChatBees python client, ```pip3 install chatbees-python-client```. For more details, refers to https://docs.chatbees.ai/chatbees/api-references/collection-operations/create-collection.
                                                               
Please replace the ```chatbeesAccountID``` and ```chatbeesCollectionName``` with your account id and collection name in ```chatbees_demo.html```. If the chat widget is used privately, please add your API key to the rest request in ```chatbees_script.js```. If the chat widget is publicly used, such as a chatbot on your website, you can create the collection with ```public_read=True```. The public_read collection answers questions without an API key. 

For any question, please feel free to create an issue in this repository or email us at build@chatbees.ai.
