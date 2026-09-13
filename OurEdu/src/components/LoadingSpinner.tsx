interface LoadingSpinnerProps {
  fullScreen?: boolean
}

export default function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  return (
    <div className={`spinner-wrap${fullScreen ? ' fullscreen' : ''}`}>
      <div className="spinner" />
    </div>
  )
}
