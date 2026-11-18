# Premiere Project Converter

Une extension CEP pour ouvrir une copie d'un projet Premiere 2027 dans Premiere 2026. L'original reste intact.

La conversion change le numéro de format du projet. Elle a été testée sur un projet 2027 dans Premiere 26.5.2 ; certaines fonctionnalités ou certains effets récents peuvent ne pas être pris en charge. Vérifiez le montage, les médias, les titres et les effets après ouverture.

## Installation

Téléchargez ce dépôt avec **Code > Download ZIP**, puis décompressez-le. Fermez Premiere Pro et lancez `install_mac.sh` sur macOS ou `install_windows.bat` sur Windows. Redémarrez Premiere 2026 et ouvrez **Fenêtre > Extensions > Project Converter**.

L'installation active le mode développeur CEP pour charger cette extension non signée. Sur Mac, si nécessaire, ouvrez le Terminal et glissez le fichier `install_mac.sh` dans la fenêtre, puis appuyez sur Entrée. Aucun téléchargement de Python ou de dépendances supplémentaires n'est nécessaire.

## Utilisation

1. Dans Premiere 2026, ouvrez le panneau et choisissez le projet `.prproj` provenant de Premiere 2027.
2. Vérifiez les informations et cliquez sur **Convertir et ouvrir**.
3. Choisissez le nom et l'emplacement de la copie. Pour protéger vos fichiers, l'extension ne remplace pas un fichier existant.
4. Si Premiere le demande, reconnectez les médias, puis vérifiez le montage. Si l'ouverture automatique échoue, ouvrez manuellement la copie indiquée dans le panneau.

Seuls les projets au format interne 46 vers le format 45 sont pris en charge. Il n'est pas nécessaire d'avoir Premiere 2027 installé pour convertir la copie.

## Changelog

Les changements des versions publiées seront indiqués ici.
