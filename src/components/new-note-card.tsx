import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {

    setContent(event.target.value);

    if (event.target.value === '') {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {

    event.preventDefault();

    if(content === ''){return}


    onNoteCreated(content);

    setContent('');

    setShouldShowOnboarding(true);

    toast.success('Note saved')
  }

  function handleStartRecording() {

    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
     || 'webkitSpeechRecognition' in window

     if(!isSpeechRecognitionAPIAvailable){
      alert('infelizmente seu navegador nao suporta a API de gravacao');
     }

     
    setIsRecording(true);
    setShouldShowOnboarding(false)

     const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

     speechRecognition = new SpeechRecognitionAPI()

     speechRecognition.lang = 'pt-BR';
     speechRecognition.continuous = true;
     speechRecognition.maxAlternatives = 1;
     speechRecognition.interimResults = true;

     speechRecognition.onresult = (event) => {

      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)

      }, '')
      
     setContent(transcription)
     }

     speechRecognition.onerror = (event) => {
      console.log(event);
     }
     
     speechRecognition.start()

  }

  function handleStopRecording(){
    setIsRecording(false);

    if(speechRecognition !== null){
      speechRecognition.stop();
    }

  }

  return (
    <Dialog.Root>
      <Dialog.DialogTrigger className="flex flex-col text-left rounded-md bg-slate-700 p-5 gap-3 outline-none focus-visible:ring-2 focus-visible:ring-lime-400 hover: ring-2 hover:ring-lime-500">
        <span className='text-sm font-medium text-slate-200'>
          Adicionar Nota
        </span>
        <p className='text-sm  leading-6 text-slate-400'>
          Grave uma nota em áudio que sera convertida para texto automaticamente.
        </p>
      </Dialog.DialogTrigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />
        <Dialog.Content className='fixed overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full h-[60hv] bg-slate-700 rounded-md outline-none flex flex-col'>

          <Dialog.Close className='rounded-xl m-1 absolute right-0 bg-slate-800 p-1.5 text-slate-400'>
            <X className='size-5 rounded-md' />
          </Dialog.Close>
          <form className='flex-1 flex flex-col'>
            <div className=' flex flex-1 flex-col gap-3 p-5 '>
              <span className='text-sm font-medium text-slate-300'>
                Adicionar Nota
              </span>

              {shouldShowOnboarding ? (
                <p className='text-sm leading-6 text-slate-400'>
                  Comece <button type='button' onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota</button> em áudio ou se preferir <button type='button' onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                </p>) : (
                <textarea
                  onChange={handleContentChange}
                  autoFocus
                  className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                  value={content} />
              )
              }

            </div>
            {isRecording ? (
              <button
                type='button'
                onClick={handleStopRecording}
                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'
              >
                <div className='size-3 rounded-full animate-pulse bg-red-600' />
                Gravando! (Clique p/ iterromper)
              </button>

            ) : (
              <button
                type='button'
                onClick={handleSaveNote}
                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
              >
                Salvar Nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>

    </Dialog.Root>
  )
}