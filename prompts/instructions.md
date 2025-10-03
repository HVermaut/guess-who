# Guess Who

## Descriptif :

Guess Who est une application web destinée à un jeu organisé pour l'anniversaire de Julie.
Dans ce jeu, Julie va devoir trouver à qui appartiennent les réponses pour gagner.

J'ai demandé aux participants de me donner des réponses aux questions suivantes :

1. Si tu devais manger le même plat toute ta vie, ce serait lequel ?
2. Ton top 3 films préférés ?
3. Ton top 3 séries préférées ?
4. Ton pire ou plus drôle surnom ?
5. Une citation que tu adores
6. Ta plus grande phobie ?
7. Si tu pouvais dîner avec une célébrité, qui choisirais-tu ?
8. Ton doudou quand tu étais petit ? M'envoyer une photo si possible
9. Si tu étais un animal, lequel serais-tu ?
10. Une chose que tu adores mais que les autres trouvent bizarre ?
11. Une chanson que tu écoutes en secret ? Vous avez presque honte de donner la réponse :P
12. Ce n'est pas une vraie soirée si cette chanson ne passe pas :

Je leur ai demandé de m'envoyer 4 photos chacun :

1. une photo de leur tête pour leur profil de participant
2. une photo de leur doudou
3. une photo de leur frère/sœur s'ils en ont
4. une photo d'eux enfant ou bébé.

## Applicatif :

Je veux créer une application qui permette à Julie de sélectionner à chacune des questions à qui elle attribue la réponse.
Pour les chansons, je veux pouvoir cliquer sur le titre et avoir un extrait de cette chanson.
Pour les films et séries, je veux pouvoir mettre une ou plusieurs images.

A la fin de chaque question, Julie doit pouvoir cliquer sur un bouton valider afin de confirmer ses réponses.
On doit voir les bonnes et les mauvaises réponses.

La dernière étape doit montrer des statistiques qui montrent qui Julie connaît le mieux.

Pour chacune des questions, il doit y avoir un seul écran où l'on voit la question, la première réponse à attribuer, puis pouvoir l'attribuer à quelqu'un. L'ensemble des participants doivent être affichés. Un rond de couleur doit apparaître autour de leur photo de profil pour dire qu'une réponse a bien été attribuée.

Julie doit pouvoir avoir la possibilité de changer les réponses avant de valider définitivement sa réponse.

## UI :

L'application doit avoir les couleurs suivantes :
#ED4C67 - #F79F1F - #303952 - #ffffff - #000000

## Parcours utilisateur :

### home

Le premier écran doit contenir une photo et en-dessous un gros bouton avec le label "Commencer" ou "Guess who" avec un emoji licorne.
Le bouton doit faire au minimum 600px de large pour au minimum 200px. La taille du texte doit faire 50px en typo Bitcount Prop Single Ink qui est une Google Font :

```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
```

Et le fond du bouton doit être arc-en-ciel.

Lorsque l'on clique sur le bouton, on doit voir une animation CSS qui fait des feux d'artifice pendant 3 secondes et qui passe à la première question.

### Écrans des questions

Dans l'ordre on doit voir :

- le numéro de la question
- la question
- une des réponses faites par un utilisateur
- les têtes grimaçantes des participants

Dans cet écran, Julie doit pouvoir attribuer la réponse à un participant.
Lorsqu'une réponse est attribuée à un participant, la réponse suivante est proposée, jusqu'à épuisement des réponses.
Julie a la possibilité de changer les réponses attribuées à un participant avec la réponse suivante.
Les réponses doivent être sauvegardé dans le fichier `data.json`dans la partie `julieResponses` et pouvoir être mise à jour si Julie change la réponse.

De base, les photos des participants sont ronde avec un contour de 4px de couleur #F79F1F.
Lorsqu'une réponse est attribuée à un participant, le contour change et doit devenir #ED4C67 et le rester jusqu'à ce que toute est été sélectionné.

Lorsque toutes les réponses de la question ont été attribuées, il faut afficher un bouton "Vérifier les réponses" qui emmène sur la page suivante qui affiche les photos de profil avec un contour de 4px #C4E538 pour les bonnes réponses et un contour de 4px #EA2027 pour les mauvaises réponses. À côté de chaque réponse doit être notée la bonne réponse.
En bas de cette page, il faut afficher un bouton "Question suivante".
Ce bouton doit avoir comme typographie "Bitcount Prop Single Ink" et un fond arc-en-ciel.

Il faut répéter ces actions jusqu'à épuisement des questions.

Pour les questions qui font référence à des films ou des séries, sous la question je veux la possibilité de voir les images corréspondantes.

Pour les questions qui concernent des chansons, je veux pouvoir également lancer la chanson via un fichier mp4.

A la fin des questions, il faut arriver sur un écran composé d'une grande photo et d'un bouton avec le label "Voir les résultats".
Le bouton doit faire au minimum 600px de large pour au minimum 200px. La taille du texte doit faire 50px en typo Bitcount Prop Single Ink qui est une Google Font. Le fond du bouton doit être arc-en-ciel.

### Écran des résultats

Cet écran doit montrer un podium de qui Julie connaît le mieux, un top 3.
Sous le top 3 on doit voir le reste des participants et le pourcentage de bonnes réponses aux questions.
