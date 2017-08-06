module App exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Markdown exposing (..)
import Http exposing (..)
import Json.Encode exposing (object, encode, string)
import Json.Decode exposing (Decoder, field)

---- MODEL ----

type alias Model =
    { content: String
    , title: String
    }

postEncoder: Model -> Json.Encode.Value
postEncoder model =
    Json.Encode.object 
        [ ("fileName", string (slugify model.title) )
        , ("markdown", string model.content )
        ]

postDecoder: Decoder String
postDecoder = 
    Json.Decode.field "" Json.Decode.string

slugify: String -> String
slugify title =
    (String.join "-" (String.words title))


init : String -> ( Model, Cmd Msg )
init path =
    ( { content = ""
    , title = "new-article.md" 
    }, getPost path )



---- UPDATE ----


type Msg
    = Change String
    | ChangeTitle String
    | SavePost 
    | SavePostCompleted (Result Http.Error String)
    | GetPost String
    | GetPostCompleted (Result Http.Error String)

savePost: Model -> Http.Request String
savePost model =
    let 
        url = 
            "https://7hsq3cvdp5.execute-api.us-west-2.amazonaws.com/latest"

        body =
            model 
                |> postEncoder
                |> Http.jsonBody
    
    in
        Http.post url body postDecoder

savePostCmd: Model -> Cmd Msg
savePostCmd model =
    Http.send SavePostCompleted (savePost model)

getPost: String -> Cmd Msg
getPost path =
    let 
        url =
            "https://s3-us-west-2.amazonaws.com/colonjs" ++ path

        request =
            Http.getString url 

    in
        Http.send GetPostCompleted request

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Change content ->
            ( { model | content = content }, Cmd.none )

        ChangeTitle title ->
            ( { model | title = title }, Cmd.none )

        SavePost ->
            ( model, savePostCmd model )

        SavePostCompleted result ->
            ( model, Cmd.none )

        GetPost path -> 
            ( { model | title = path }, Cmd.none )

        GetPostCompleted (Ok data) ->
            ( { model | content = data }, Cmd.none )

        GetPostCompleted (Err _) ->
            ( model, Cmd.none )



---- VIEW ----


view : Model -> Html Msg
view model =
    main_ []
        [ h1 [] 
            [ input [ value model.title, onInput ChangeTitle ] []
            ]
        , div [ class "editor" ] 
            [ textarea [ class "md-editor", onInput Change ] [ text model.content ]
            , Markdown.toHtml [ class "output" ] model.content
            ]
        , div [ class "button-group" ] 
            [ button [ onClick SavePost ] [ text "Save" ]
            ]
        ]



---- PROGRAM ----


main : Program String Model Msg
main =
    Html.programWithFlags
        { view = view
        , init = init
        , update = update
        , subscriptions = \_ -> Sub.none
        }
